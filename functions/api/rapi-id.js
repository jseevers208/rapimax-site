import { corsResponse, handleOptions, errorResponse } from './_helpers.js';

export async function onRequestOptions() { return handleOptions(); }

/**
 * POST /api/rapi-id
 * Receives cédula images (front + optional back), sends to Claude Vision for parsing.
 * Returns structured applicant data to auto-fill the form.
 */
export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.ANTHROPIC_API_KEY) {
    return errorResponse('Rapi-ID Check no está configurado. Contactá al administrador.', 503);
  }

  try {
    const formData = await request.formData();
    const frontFile = formData.get('front');
    const backFile = formData.get('back');

    if (!frontFile) {
      return errorResponse('Se requiere la imagen frontal de la cédula.');
    }

    // Validate file types
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(frontFile.type)) {
      return errorResponse('Solo se aceptan imágenes (JPEG, PNG, WebP).');
    }
    if (backFile && !allowedTypes.includes(backFile.type)) {
      return errorResponse('Solo se aceptan imágenes (JPEG, PNG, WebP).');
    }

    // Max 5MB per image
    if (frontFile.size > 5 * 1024 * 1024) return errorResponse('La imagen frontal excede 5MB.');
    if (backFile && backFile.size > 5 * 1024 * 1024) return errorResponse('La imagen trasera excede 5MB.');

    // Convert to base64 (chunked to avoid stack overflow on large images)
    function arrayBufferToBase64(buffer) {
      const bytes = new Uint8Array(buffer);
      let binary = '';
      const chunkSize = 8192;
      for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.subarray(i, i + chunkSize);
        binary += String.fromCharCode.apply(null, chunk);
      }
      return btoa(binary);
    }

    const frontBuffer = await frontFile.arrayBuffer();
    const frontBase64 = arrayBufferToBase64(frontBuffer);

    // Build Claude message content
    const content = [
      {
        type: 'image',
        source: { type: 'base64', media_type: frontFile.type, data: frontBase64 }
      }
    ];

    if (backFile) {
      var backBuffer = await backFile.arrayBuffer();
      const backBase64 = arrayBufferToBase64(backBuffer);
      content.push({
        type: 'image',
        source: { type: 'base64', media_type: backFile.type, data: backBase64 }
      });
    }

    content.push({
      type: 'text',
      text: `You are analyzing a Costa Rican "Cédula de Identidad" issued by the Tribunal Supremo de Elecciones. The card has two sides:

FRONT SIDE contains:
- Large ID number (format: X XXXX XXXX)
- "Nombre:" (first/middle names)
- "1° Apellido:" (first surname)
- "2° Apellido:" (second surname)
- Photo and signature

BACK SIDE contains:
- "Número de Cédula:" (same ID number)
- "Nacimiento:" (birth date in DD MM YYYY format)
- After birth date, the place of birth (distrito/cantón/provincia)
- "Nombre del Padre:" (father's full name)
- "Nombre de la Madre:" (mother's full name)
- "Domicilio Electoral:" (electoral address — distrito cantón provincia)
- "Vencimiento:" (expiration date DD MM YYYY)
- "Sexo:" (M or F)

The text on the back is printed VERTICALLY (rotated 90°). Read it carefully.

Extract ALL visible information from BOTH sides and return ONLY a JSON object:

{
  "idNumber": "Full cédula number with spaces (e.g. 1 0783 0451)",
  "firstName": "Nombre field (first/middle names)",
  "firstSurname": "1° Apellido",
  "secondSurname": "2° Apellido",
  "fullName": "Combine: Nombre + 1° Apellido + 2° Apellido",
  "gender": "M or F from Sexo field",
  "birthDate": "Convert DD MM YYYY to YYYY-MM-DD format",
  "birthPlace": "Place after birth date (distrito/cantón)",
  "birthProvince": "Province from birth place (e.g. San José, Alajuela, Heredia, Cartago, Guanacaste, Puntarenas, Limón)",
  "birthCanton": "Canton from birth place (e.g. Escazú, Central, Desamparados)",
  "fatherName": "Nombre del Padre",
  "motherName": "Nombre de la Madre",
  "electoralAddress": "Full Domicilio Electoral text",
  "homeProvince": "Province from Domicilio Electoral",
  "homeCanton": "Canton from Domicilio Electoral",
  "expirationDate": "Convert DD MM YYYY to YYYY-MM-DD",
  "nationality": "Costarricense"
}

Return ONLY the JSON object. Use empty string for anything not visible. Do NOT guess — only extract what you can clearly read.`
    });

    // Call Claude API
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{ role: 'user', content }],
      }),
    });

    if (!claudeResponse.ok) {
      const errText = await claudeResponse.text();
      console.error('Claude API error:', claudeResponse.status, errText);
      return errorResponse('Error al procesar la imagen. Intentá de nuevo.', 500);
    }

    const claudeData = await claudeResponse.json();
    const responseText = claudeData.content?.[0]?.text || '';

    // Parse JSON response
    let parsed;
    try {
      // Clean potential markdown fences
      const cleaned = responseText.replace(/```json\s*|```\s*/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error('Failed to parse Claude response:', responseText);
      return errorResponse('No se pudo interpretar la cédula. Intentá con una imagen más clara.', 422);
    }

    // Map to form field names
    const formData2 = {
      applicantIdType: 'cedula',
      applicantIdNumber: (parsed.idNumber || '').replace(/\s/g, ''),
      applicantFullName: parsed.fullName || '',
      applicantGender: parsed.gender || '',
      birthDate: parsed.birthDate || '',
      birthPlace: parsed.birthPlace || '',
      birthCountry: 'Costa Rica',
      birthProvince: parsed.birthProvince || '',
      birthCanton: parsed.birthCanton || '',
      nationality: parsed.nationality || 'Costarricense',
      homeProvince: parsed.homeProvince || '',
      homeCanton: parsed.homeCanton || '',
    };

    // Build review fields for the UI
    const reviewFields = [
      { key: 'applicantIdNumber', label: 'Número de cédula', value: parsed.idNumber || '' },
      { key: 'applicantFullName', label: 'Nombre completo', value: formData2.applicantFullName },
      { key: 'applicantGender', label: 'Sexo', value: formData2.applicantGender },
      { key: 'birthDate', label: 'Fecha de nacimiento', value: formData2.birthDate },
      { key: 'birthPlace', label: 'Lugar de nacimiento', value: formData2.birthPlace },
      { key: 'birthProvince', label: 'Provincia (nacimiento)', value: formData2.birthProvince },
      { key: 'nationality', label: 'Nacionalidad', value: formData2.nationality },
      { key: 'homeProvince', label: 'Provincia (domicilio)', value: formData2.homeProvince },
      { key: 'homeCanton', label: 'Cantón (domicilio)', value: formData2.homeCanton },
    ];

    // Extra info for admin reference (not mapped to form)
    const adminExtras = {
      fatherName: parsed.fatherName || '',
      motherName: parsed.motherName || '',
      electoralAddress: parsed.electoralAddress || '',
      expirationDate: parsed.expirationDate || '',
    };
    const detectedCount = reviewFields.filter(f => f.value).length;

    // Store images to R2 for admin access
    let r2FrontKey = '';
    let r2BackKey = '';
    const idNum = (parsed.idNumber || 'unknown').replace(/[^a-zA-Z0-9-]/g, '');
    const ts = Date.now();

    if (env.DOCUMENTS) {
      try {
        const frontExt = frontFile.type.split('/')[1] || 'jpg';
        r2FrontKey = `cedulas/${idNum}_${ts}_front.${frontExt}`;
        await env.DOCUMENTS.put(r2FrontKey, frontBuffer, { httpMetadata: { contentType: frontFile.type } });

        if (backFile) {
          const backExt = backFile.type.split('/')[1] || 'jpg';
          r2BackKey = `cedulas/${idNum}_${ts}_back.${backExt}`;
          await env.DOCUMENTS.put(r2BackKey, backBuffer, { httpMetadata: { contentType: backFile.type } });
        }
      } catch (r2Err) {
        console.error('R2 upload error:', r2Err);
        // Non-blocking — scan still succeeds even if storage fails
      }
    }

    // Log activity
    try {
      await env.DB.prepare(
        `INSERT INTO activity_log (record_type, record_id, action, new_value, actor) VALUES (?, ?, ?, ?, ?)`
      ).bind('rapi_id', 0, 'cedula_scanned', JSON.stringify({ id: idNum, r2Front: r2FrontKey, r2Back: r2BackKey, detected: detectedCount }), 'system').run();
    } catch (e) { console.error('Activity log error:', e); }

    return corsResponse({
      success: true,
      data: formData2,
      reviewFields,
      detectedCount,
      totalFields: reviewFields.length,
      adminExtras,
      r2Keys: { front: r2FrontKey, back: r2BackKey },
      rawExtracted: parsed,
      message: detectedCount >= 7
        ? '¡Cédula procesada exitosamente!'
        : detectedCount >= 4
          ? 'Se detectaron algunos datos. Revisá los campos antes de aceptar.'
          : 'La imagen no es muy clara. Te recomendamos intentar con otra foto.'
    });

  } catch (err) {
    console.error('Rapi-ID error:', err);
    return errorResponse('Error interno al procesar la cédula.', 500);
  }
}
