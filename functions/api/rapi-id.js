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

    // Convert to base64
    const frontBuffer = await frontFile.arrayBuffer();
    const frontBase64 = btoa(String.fromCharCode(...new Uint8Array(frontBuffer)));

    // Build Claude message content
    const content = [
      {
        type: 'image',
        source: { type: 'base64', media_type: frontFile.type, data: frontBase64 }
      }
    ];

    if (backFile) {
      const backBuffer = await backFile.arrayBuffer();
      const backBase64 = btoa(String.fromCharCode(...new Uint8Array(backBuffer)));
      content.push({
        type: 'image',
        source: { type: 'base64', media_type: backFile.type, data: backBase64 }
      });
    }

    content.push({
      type: 'text',
      text: `Analyze this Costa Rican cédula (identity document). Extract all visible information and return ONLY a JSON object with these fields (use empty string for anything not visible):

{
  "idNumber": "ID number (cédula number)",
  "fullName": "Full name as shown",
  "firstName": "First name(s)",
  "lastName": "Last name(s)",
  "gender": "M or F",
  "birthDate": "YYYY-MM-DD format",
  "birthPlace": "Place of birth if visible",
  "nationality": "Nationality",
  "expirationDate": "Document expiration date YYYY-MM-DD if visible",
  "maritalStatus": "If visible",
  "address": "If visible on back",
  "province": "Province if visible",
  "canton": "Canton if visible"
}

Return ONLY the JSON object, no explanation, no markdown.`
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
      applicantIdNumber: parsed.idNumber || '',
      applicantFullName: parsed.fullName || '',
      applicantGender: parsed.gender || '',
      birthDate: parsed.birthDate || '',
      birthPlace: parsed.birthPlace || '',
      nationality: parsed.nationality || 'Costarricense',
      birthProvince: parsed.province || '',
      birthCanton: parsed.canton || '',
      maritalStatus: parsed.maritalStatus || '',
      homeAddress: parsed.address || '',
      homeProvince: parsed.province || '',
    };

    // Log activity
    try {
      await env.DB.prepare(
        `INSERT INTO activity_log (record_type, record_id, action, new_value, actor) VALUES (?, ?, ?, ?, ?)`
      ).bind('rapi_id', 0, 'cedula_scanned', parsed.idNumber || 'unknown', 'system').run();
    } catch (e) { console.error('Activity log error:', e); }

    return corsResponse({
      success: true,
      data: formData2,
      rawExtracted: parsed,
      message: '¡Cédula procesada exitosamente!'
    });

  } catch (err) {
    console.error('Rapi-ID error:', err);
    return errorResponse('Error interno al procesar la cédula.', 500);
  }
}
