<script>
  // ============================================
  // i18n
  // ============================================
  const LANG_KEY = 'rapimax_admin_lang';
  let lang = (typeof localStorage !== 'undefined' && localStorage.getItem(LANG_KEY)) || 'es';

  const i18n = {
    es: {
      login_title: 'Panel de Administración',
      login_btn: 'Ingresar',
      login_placeholder: 'Contraseña',
      login_error: 'Contraseña incorrecta.',
      logout: 'Cerrar sesión',
      dashboard: 'Dashboard',
      applications: 'Solicitudes',
      contacts: 'Contactos',
      leads: 'Leads',
      cases: 'Casos',
      settings: 'Configuración',
      search_placeholder: 'Buscar por nombre, cédula, email, teléfono...',
      export_csv: 'Exportar CSV',
      no_records: 'No hay registros.',
      loading: 'Cargando...',
      today: 'Hoy',
      this_week: 'Esta semana',
      total: 'Total',
      pipeline_value: 'Pipeline',
      attention_needed: 'Requieren atención',
      attention_desc: 'Solicitudes en "nueva" por más de 48 horas',
      status_funnel: 'Embudo de estados',
      leads_trend: 'Leads (últimos 30 días)',
      by_province: 'Por provincia',
      recent_activity: 'Actividad reciente',
      conversion: 'Conversión',
      date: 'Fecha',
      name: 'Nombre',
      id_number: 'Cédula',
      amount: 'Monto',
      term: 'Plazo',
      phone: 'Teléfono',
      email: 'Email',
      status: 'Estado',
      priority: 'Prioridad',
      actions: 'Acciones',
      message: 'Mensaje',
      vehicle_type: 'Tipo',
      value: 'Valor',
      down_payment: 'Prima',
      monthly: 'Cuota',
      detail: 'Detalle',
      notes: 'Notas',
      add_note: 'Agregar nota',
      note_placeholder: 'Escribir una nota interna...',
      history: 'Historial',
      back: 'Volver',
      whatsapp: 'WhatsApp',
      call: 'Llamar',
      send_email: 'Email',
      save: 'Guardar',
      saved: '¡Guardado!',
      site_settings: 'Configuración del sitio',
      content_editor: 'Contenido del sitio',
      content_desc: 'Editá los textos de cada página sin tocar código.',
      partners: 'Socios / Distribuidores',
      partners_desc: 'Administrá los puntos que aparecen en el mapa.',
      add_partner: 'Agregar socio',
      edit_partner: 'Editar socio',
      partner_name: 'Nombre',
      partner_category: 'Categoría',
      partner_address: 'Dirección',
      partner_province: 'Provincia',
      partner_lat: 'Latitud',
      partner_lng: 'Longitud',
      partner_phone: 'Teléfono',
      partner_website: 'Sitio web',
      partner_active: 'Activo',
      partner_order: 'Orden',
      content_page: 'Página',
      content_section: 'Sección',
      content_key: 'Campo',
      content_es: 'Español',
      content_en: 'Inglés',
      add_content: 'Agregar bloque',
      cancel: 'Cancelar',
      delete: 'Eliminar',
      confirm_delete: '¿Seguro que querés eliminar este registro?',
      page_of: 'Página {page} de {total}',
      prev: '← Anterior',
      next: 'Siguiente →',
      assign: 'Asignar',
      assigned_to: 'Asignado a',
      filter_status: 'Filtrar estado',
      filter_priority: 'Filtrar prioridad',
      all: 'Todos',
      from_date: 'Desde',
      to_date: 'Hasta',
      applicant_info: 'Datos del solicitante',
      employment_info: 'Datos laborales',
      spouse_info: 'Datos del cónyuge',
      references_info: 'Referencias',
      address_info: 'Dirección',
      nueva: 'Nueva', 'en-proceso': 'En proceso', contactada: 'Contactada', documentos: 'Documentos',
      'en-revision': 'En revisión', aprobada: 'Aprobada', rechazada: 'Rechazada',
      desembolsada: 'Desembolsada', completada: 'Completada',
      lead: 'Lead', contactado: 'Contactado', cerrado: 'Cerrado',
      create_case: 'Crear caso', view_kanban: 'Kanban', view_list: 'Lista',
      follow_up: 'Seguimiento', next_steps_label: 'Próximos pasos',
      overdue: 'Vencidos', unassigned: 'Sin asignar', source_label: 'Origen',
      linked_records: 'Registros vinculados', lookup_placeholder: 'Buscar por nombre, email o teléfono...',
      case_detail: 'Detalle del caso', estimated_value_label: 'Valor estimado',
      normal: 'Normal', alta: 'Alta', urgente: 'Urgente',
      status_changed: 'Estado cambiado', note_added: 'Nota agregada',
      assigned: 'Asignado', exported: 'Exportado', created: 'Creado',
    },
    en: {
      login_title: 'Admin Panel',
      login_btn: 'Sign in',
      login_placeholder: 'Password',
      login_error: 'Incorrect password.',
      logout: 'Sign out',
      dashboard: 'Dashboard',
      applications: 'Applications',
      contacts: 'Contacts',
      leads: 'Leads',
      cases: 'Cases',
      settings: 'Settings',
      search_placeholder: 'Search by name, ID, email, phone...',
      export_csv: 'Export CSV',
      no_records: 'No records found.',
      loading: 'Loading...',
      today: 'Today',
      this_week: 'This week',
      total: 'Total',
      pipeline_value: 'Pipeline',
      attention_needed: 'Needs attention',
      attention_desc: 'Applications in "new" for 48+ hours',
      status_funnel: 'Status funnel',
      leads_trend: 'Leads (last 30 days)',
      by_province: 'By province',
      recent_activity: 'Recent activity',
      conversion: 'Conversion',
      date: 'Date',
      name: 'Name',
      id_number: 'ID Number',
      amount: 'Amount',
      term: 'Term',
      phone: 'Phone',
      email: 'Email',
      status: 'Status',
      priority: 'Priority',
      actions: 'Actions',
      message: 'Message',
      vehicle_type: 'Type',
      value: 'Value',
      down_payment: 'Down payment',
      monthly: 'Monthly',
      detail: 'Detail',
      notes: 'Notes',
      add_note: 'Add note',
      note_placeholder: 'Write an internal note...',
      history: 'History',
      back: 'Back',
      whatsapp: 'WhatsApp',
      call: 'Call',
      send_email: 'Email',
      save: 'Save',
      saved: 'Saved!',
      site_settings: 'Site settings',
      content_editor: 'Site content',
      content_desc: 'Edit page text without touching code.',
      partners: 'Partners / Dealers',
      partners_desc: 'Manage the locations shown on the map.',
      add_partner: 'Add partner',
      edit_partner: 'Edit partner',
      partner_name: 'Name',
      partner_category: 'Category',
      partner_address: 'Address',
      partner_province: 'Province',
      partner_lat: 'Latitude',
      partner_lng: 'Longitude',
      partner_phone: 'Phone',
      partner_website: 'Website',
      partner_active: 'Active',
      partner_order: 'Sort order',
      content_page: 'Page',
      content_section: 'Section',
      content_key: 'Field',
      content_es: 'Spanish',
      content_en: 'English',
      add_content: 'Add block',
      cancel: 'Cancel',
      delete: 'Delete',
      confirm_delete: 'Are you sure you want to delete this record?',
      page_of: 'Page {page} of {total}',
      prev: '← Previous',
      next: 'Next →',
      assign: 'Assign',
      assigned_to: 'Assigned to',
      filter_status: 'Filter status',
      filter_priority: 'Filter priority',
      all: 'All',
      from_date: 'From',
      to_date: 'To',
      applicant_info: 'Applicant info',
      employment_info: 'Employment info',
      spouse_info: 'Spouse info',
      references_info: 'References',
      address_info: 'Address',
      nueva: 'New', 'en-proceso': 'In progress', contactada: 'Contacted', documentos: 'Documents',
      'en-revision': 'Under review', aprobada: 'Approved', rechazada: 'Rejected',
      desembolsada: 'Disbursed', completada: 'Completed',
      lead: 'Lead', contactado: 'Contacted', cerrado: 'Closed',
      create_case: 'Create case', view_kanban: 'Kanban', view_list: 'List',
      follow_up: 'Follow-up', next_steps_label: 'Next steps',
      overdue: 'Overdue', unassigned: 'Unassigned', source_label: 'Source',
      linked_records: 'Linked records', lookup_placeholder: 'Search by name, email or phone...',
      case_detail: 'Case detail', estimated_value_label: 'Estimated value',
      normal: 'Normal', alta: 'High', urgente: 'Urgent',
      status_changed: 'Status changed', note_added: 'Note added',
      assigned: 'Assigned', exported: 'Exported', created: 'Created',
    },
  };

  $: t = (key) => i18n[lang]?.[key] || i18n.es[key] || key;
  function toggleLang() {
    lang = lang === 'es' ? 'en' : 'es';
    if (typeof localStorage !== 'undefined') localStorage.setItem(LANG_KEY, lang);
  }

  // ============================================
  // State
  // ============================================
  let token = (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('rapimax_admin_token')) || '';
  let loginError = '';
  let loginEmail = '';
  let loginMode = 'login'; // 'login' | 'reset_request' | 'reset_confirm'
  let resetMessage = '';
  let resetToken = '';
  let newPassword = '';
  let currentUser = null; // { id, email, role, name }

  // Restore user from session
  try { currentUser = JSON.parse(sessionStorage.getItem('rapimax_admin_user') || 'null'); } catch { currentUser = null; }
  // Check URL for password reset token
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const rt = urlParams.get('reset');
    if (rt) { resetToken = rt; loginMode = 'reset_confirm'; window.history.replaceState({}, '', '/admin/'); }
  }
  let isLoggedIn = !!token;
  let passwordInput = '';

  let activeTab = 'dashboard';
  let data = [];
  let total = 0;
  let page = 1;
  let totalPages = 1;
  let loading = false;
  let stats = null;

  // Filters
  let searchQuery = '';
  let filterStatus = '';
  let filterPriority = '';
  let dateFrom = '';
  let dateTo = '';
  let sortBy = 'created_at';
  let sortDir = 'desc';

  // Detail view
  let detailView = null;
  let detailNotes = [];
  let detailActivity = [];
  let detailRapiId = null;
  let newNoteText = '';
  let noteSaving = false;

  // Settings
  let siteSettings = {};
  let settingsSaving = false;
  let settingsSaved = false;

  // CMS sub-tab
  let settingsTab = 'settings'; // 'settings' | 'content' | 'partners' | 'users'

  // Content editor
  let contentBlocks = [];
  let contentSaving = false;
  let contentSaved = false;
  let showAddContent = false;
  let newContent = { page: 'home', section: '', fieldKey: '', valueEs: '', valueEn: '' };

  // Partners
  let partners = [];
  let partnerSaving = false;
  let partnerSaved = false;
  let editingPartner = null; // null = list view, object = editing
  let newPartner = { name: '', category: 'dealer', address: '', province: '', latitude: '', longitude: '', phone: '', website: '', isActive: 1, sortOrder: 0 };

  // Cases CRM
  let casesView = 'kanban'; // 'kanban' | 'list'
  let casesKanban = {};
  let casesList = [];
  let casesTotal = 0;
  let casesPage = 1;
  let casesTotalPages = 1;
  let casesLoading = false;
  let caseDetail = null;
  let showCreateCaseFromDetail = false;
  let caseNotes = [];
  let caseActivity = [];
  let caseNewNote = '';
  let caseNoteSaving = false;
  let showCreateCase = false;
  let lookupQuery = '';
  let lookupResults = [];
  let lookupLoading = false;
  let newCase = { fullName: '', email: '', phone: '', source: 'manual', status: 'lead', assignedTo: '', priority: 'normal', followUpDate: '', nextSteps: '', estimatedValue: '', linkedApplicationId: null, linkedContactId: null, linkedLeadIds: [] };
  let casesStats = null;

  const CASE_STATUSES = ['lead', 'contactado', 'en-proceso', 'documentos', 'en-revision', 'aprobado', 'rechazado', 'desembolsado', 'cerrado'];
  const CASE_STATUS_COLORS = {
    lead: '#d5b584', contactado: '#8b5cf6', 'en-proceso': '#5b8fd9', documentos: '#f59e0b',
    'en-revision': '#6366f1', aprobado: '#22c55e', rechazado: '#ef4444', desembolsado: '#14b8a6', cerrado: '#6b7280',
  };

  const STATUS_LIST = ['nueva', 'en-proceso', 'contactada', 'documentos', 'en-revision', 'aprobada', 'rechazada', 'desembolsada', 'completada'];
  const PRIORITY_LIST = ['normal', 'alta', 'urgente'];
  const STATUS_COLORS = {
    nueva: '#d5b584', 'en-proceso': '#5b8fd9', contactada: '#8b5cf6', documentos: '#f59e0b',
    'en-revision': '#6366f1', aprobada: '#22c55e', rechazada: '#ef4444', desembolsada: '#14b8a6', completada: '#6b7280',
  };
  const PRIORITY_COLORS = { normal: '#6b7280', alta: '#f59e0b', urgente: '#ef4444' };

  const tabs = [
    { id: 'dashboard', icon: '📊' },
    { id: 'applications', icon: '📋' },
    { id: 'contacts', icon: '💬' },
    { id: 'leads', icon: '📈' },
    { id: 'cases', icon: '🗂️' },
    { id: 'settings', icon: '⚙️' },
  ];

  // ============================================
  // API Helpers
  // ============================================
  async function api(method, params = {}, body = null) {
    const headers = { Authorization: `Bearer ${token}` };
    if (body) headers['Content-Type'] = 'application/json';
    const url = method === 'GET'
      ? `/api/admin?${new URLSearchParams(params)}`
      : '/api/admin';
    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (res.status === 401) { handleLogout(); return null; }
    return res.json();
  }

  // ============================================
  // Auth
  // ============================================
  async function handleLogin() {
    loginError = '';
    try {
      const body = loginEmail
        ? { action: 'login', email: loginEmail, password: passwordInput }
        : { password: passwordInput };
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const result = await res.json();
      if (result.success) {
        token = result.token;
        currentUser = result.user || null;
        sessionStorage.setItem('rapimax_admin_token', token);
        if (currentUser) sessionStorage.setItem('rapimax_admin_user', JSON.stringify(currentUser));
        isLoggedIn = true;
        loadDashboard();
      } else {
        loginError = result.error || t('login_error');
      }
    } catch { loginError = 'Error de conexión.'; }
  }

  async function handleResetRequest() {
    loginError = ''; resetMessage = '';
    if (!loginEmail) { loginError = 'Ingresá tu email.'; return; }
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset_password_request', email: loginEmail }),
      });
      const result = await res.json();
      resetMessage = result.message || 'Revisá tu email.';
    } catch { loginError = 'Error de conexión.'; }
  }

  async function handleResetPassword() {
    loginError = ''; resetMessage = '';
    if (!newPassword || newPassword.length < 8) { loginError = 'La contraseña debe tener al menos 8 caracteres.'; return; }
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset_password', token: resetToken, newPassword }),
      });
      const result = await res.json();
      if (result.success) { resetMessage = result.message; loginMode = 'login'; resetToken = ''; newPassword = ''; }
      else loginError = result.error || 'Error al restablecer.';
    } catch { loginError = 'Error de conexión.'; }
  }

  // User management state
  let adminUsers = [];
  let newUserForm = { email: '', password: '', name: '', role: 'admin' };
  let userMessage = '';

  async function loadUsers() {
    userMessage = '';
    try {
      const result = await api('GET', { action: 'users' });
      adminUsers = result.users || [];
    } catch { adminUsers = []; }
  }

  async function createUser() {
    userMessage = '';
    if (!newUserForm.email || !newUserForm.password || !newUserForm.name) { userMessage = 'Todos los campos son requeridos.'; return; }
    try {
      const result = await api('POST', {}, { action: 'create_user', ...newUserForm });
      if (result.success) {
        userMessage = result.message;
        newUserForm = { email: '', password: '', name: '', role: 'admin' };
        loadUsers();
      } else userMessage = result.error || 'Error al crear usuario.';
    } catch { userMessage = 'Error de conexión.'; }
  }

  async function toggleUserActive(userId, isActive) {
    await api('POST', {}, { action: 'update_user', userId, isActive: !isActive });
    loadUsers();
  }

  async function changeUserRole(userId, role) {
    await api('POST', {}, { action: 'update_user', userId, role });
    loadUsers();
  }

  async function deleteUser(userId, name) {
    if (!confirm(`¿Estás seguro de eliminar al usuario "${name}"? Esta acción no se puede deshacer.`)) return;
    const result = await api('POST', {}, { action: 'delete_user', userId });
    if (result?.success) { userMessage = result.message; loadUsers(); }
    else userMessage = result?.error || 'Error al eliminar usuario.';
  }

  let resetPwUserId = null;
  let resetPwValue = '';
  let resetPwMsg = '';

  async function resetUserPassword() {
    if (!resetPwValue || resetPwValue.length < 8) { resetPwMsg = 'Mínimo 8 caracteres.'; return; }
    const result = await api('POST', {}, { action: 'update_user', userId: resetPwUserId, newPassword: resetPwValue });
    if (result?.success) { resetPwMsg = '✅ Contraseña actualizada.'; resetPwValue = ''; setTimeout(() => { resetPwUserId = null; resetPwMsg = ''; }, 2000); }
    else resetPwMsg = result?.error || 'Error.';
  }

  function handleLogout() {
    token = ''; isLoggedIn = false; currentUser = null;
    sessionStorage.removeItem('rapimax_admin_token');
    sessionStorage.removeItem('rapimax_admin_user');
  }

  // ============================================
  // Dashboard
  // ============================================
  async function loadDashboard() {
    loading = true;
    const result = await api('GET', { action: 'stats' });
    if (result) stats = result;
    loading = false;
  }

  // ============================================
  // List Data
  // ============================================
  async function fetchList(type) {
    loading = true;
    const params = { action: 'list', type, page: String(page), sort: sortBy, dir: sortDir };
    if (searchQuery) params.q = searchQuery;
    if (filterStatus) params.status = filterStatus;
    if (filterPriority && type === 'applications') params.priority = filterPriority;
    if (dateFrom) params.from = dateFrom;
    if (dateTo) params.to = dateTo;
    const result = await api('GET', params);
    if (result) {
      data = result.data || [];
      total = result.total || 0;
      totalPages = result.totalPages || 1;
    }
    loading = false;
  }

  function switchTab(tabId) {
    activeTab = tabId;
    page = 1; searchQuery = ''; filterStatus = ''; filterPriority = ''; dateFrom = ''; dateTo = '';
    detailView = null; data = []; caseDetail = null;
    if (tabId === 'dashboard') loadDashboard();
    else if (tabId === 'settings') loadSettings();
    else if (tabId === 'cases') loadCases();
    else if (['applications', 'contacts', 'leads'].includes(tabId)) fetchList(tabId);
  }

  function goPage(p) { page = p; fetchList(activeTab); }

  function applyFilters() { page = 1; fetchList(activeTab); }

  let searchTimeout;
  function handleSearch(e) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => { page = 1; fetchList(activeTab); }, 400);
  }

  function toggleSort(col) {
    if (sortBy === col) sortDir = sortDir === 'desc' ? 'asc' : 'desc';
    else { sortBy = col; sortDir = 'desc'; }
    fetchList(activeTab);
  }

  // ============================================
  // Detail View
  // ============================================
  async function openDetail(type, id) {
    loading = true;
    const result = await api('GET', { action: 'detail', type, id: String(id) });
    if (result) {
      detailView = { type, ...result.record };
      detailRapiId = result.rapiIdData || null;
      detailNotes = result.notes || [];
      detailActivity = result.activity || [];
    }
    loading = false;
  }

  function closeDetail() { detailView = null; detailNotes = []; detailActivity = []; detailRapiId = null; newNoteText = ''; }

  async function addNote() {
    if (!newNoteText.trim() || !detailView) return;
    noteSaving = true;
    await api('POST', {}, { action: 'add_note', recordType: detailView.type, recordId: detailView.id, content: newNoteText.trim() });
    newNoteText = '';
    const result = await api('GET', { action: 'detail', type: detailView.type, id: String(detailView.id) });
    if (result) { detailNotes = result.notes || []; detailActivity = result.activity || []; }
    noteSaving = false;
  }

  async function changeStatus(type, id, newStatus) {
    await api('POST', {}, { action: 'update_status', type, id, status: newStatus });
    if (detailView && detailView.id === id) detailView.status = newStatus;
    if (activeTab === 'dashboard') loadDashboard();
    else fetchList(activeTab);
  }

  async function changePriority(id, newPriority) {
    await api('POST', {}, { action: 'update_priority', id, priority: newPriority });
    if (detailView && detailView.id === id) detailView.priority = newPriority;
    fetchList('applications');
  }

  // ============================================
  // Export
  // ============================================
  function exportCSV() {
    const params = new URLSearchParams({ action: 'list', type: activeTab, format: 'csv' });
    if (filterStatus) params.set('status', filterStatus);
    if (searchQuery) params.set('q', searchQuery);
    fetch(`/api/admin?${params}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.blob())
      .then(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${activeTab}-${new Date().toISOString().slice(0,10)}.csv`;
        a.click();
      });
  }

  // ============================================
  // Quick Actions
  // ============================================
  function openWhatsApp(phone) {
    const clean = (phone || '').replace(/[^0-9+]/g, '');
    const num = clean.startsWith('+') ? clean.slice(1) : (clean.startsWith('506') ? clean : '506' + clean);
    window.open(`https://wa.me/${num}?text=Hola, le contactamos de RapiMax respecto a su solicitud de financiamiento.`, '_blank');
  }
  function openCall(phone) {
    const clean = (phone || '').replace(/[^0-9+]/g, '');
    window.location.href = `tel:${clean.startsWith('+') ? clean : '+506' + clean}`;
  }
  function openEmail(email) {
    window.location.href = `mailto:${email}?subject=RapiMax - Seguimiento de solicitud`;
  }

  // ============================================
  // Settings / CMS
  // ============================================
  async function loadSettings() {
    loading = true;
    const result = await api('GET', { action: 'settings' });
    if (result) siteSettings = result.settings || {};
    loading = false;
  }

  async function saveSettings() {
    settingsSaving = true;
    await api('POST', {}, { action: 'update_settings', settings: siteSettings });
    settingsSaving = false;
    settingsSaved = true;
    setTimeout(() => settingsSaved = false, 2000);
  }

  // Content editor
  async function loadContent() {
    const result = await api('GET', { action: 'content' });
    if (result) contentBlocks = result.content || [];
  }

  async function saveContentBlock(block) {
    contentSaving = true;
    await api('POST', {}, {
      action: 'update_content',
      page: block.page,
      section: block.section,
      fieldKey: block.fieldKey,
      valueEs: block.valueEs,
      valueEn: block.valueEn || '',
    });
    contentSaving = false;
    contentSaved = true;
    setTimeout(() => contentSaved = false, 2000);
  }

  async function addContentBlock() {
    if (!newContent.section || !newContent.fieldKey || !newContent.valueEs) return;
    await api('POST', {}, {
      action: 'update_content',
      page: newContent.page,
      section: newContent.section,
      fieldKey: newContent.fieldKey,
      valueEs: newContent.valueEs,
      valueEn: newContent.valueEn || '',
    });
    newContent = { page: 'home', section: '', fieldKey: '', valueEs: '', valueEn: '' };
    showAddContent = false;
    loadContent();
  }

  // Partners
  async function loadPartners() {
    const result = await api('GET', { action: 'partners' });
    if (result) partners = result.partners || [];
  }

  async function savePartner(partner) {
    partnerSaving = true;
    await api('POST', {}, { action: 'upsert_partner', partner });
    partnerSaving = false;
    partnerSaved = true;
    editingPartner = null;
    loadPartners();
    setTimeout(() => partnerSaved = false, 2000);
  }

  async function deletePartner(id) {
    if (!confirm(t('confirm_delete'))) return;
    await api('POST', {}, { action: 'delete_partner', id });
    loadPartners();
  }

  function startEditPartner(p) {
    editingPartner = { ...p };
  }

  function startNewPartner() {
    editingPartner = { name: '', category: 'dealer', address: '', province: '', latitude: '', longitude: '', phone: '', website: '', isActive: 1, sortOrder: 0 };
  }

  function cancelEditPartner() {
    editingPartner = null;
  }

  function switchSettingsTab(tab) {
    settingsTab = tab;
    if (tab === 'content' && !contentBlocks.length) loadContent();
    if (tab === 'partners' && !partners.length) loadPartners();
    if (tab === 'users' && !adminUsers.length) loadUsers();
  }

  // ============================================
  // Cases CRM
  // ============================================
  async function loadCasesKanban() {
    casesLoading = true;
    try {
      const res = await fetch('/api/cases?action=kanban', { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 401) { handleLogout(); return; }
      const result = await res.json();
      casesKanban = result.kanban || {};
    } catch { casesKanban = {}; }
    casesLoading = false;
  }

  async function loadCasesList() {
    casesLoading = true;
    const params = new URLSearchParams({ action: 'list', page: String(casesPage), sort: 'updated_at', dir: 'desc' });
    if (filterStatus) params.set('status', filterStatus);
    if (filterPriority) params.set('priority', filterPriority);
    if (searchQuery) params.set('q', searchQuery);
    try {
      const res = await fetch(`/api/cases?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      const result = await res.json();
      casesList = result.data || [];
      casesTotal = result.total || 0;
      casesTotalPages = result.totalPages || 1;
    } catch { casesList = []; }
    casesLoading = false;
  }

  async function loadCasesStats() {
    try {
      const res = await fetch('/api/cases?action=stats', { headers: { Authorization: `Bearer ${token}` } });
      casesStats = await res.json();
    } catch { casesStats = null; }
  }

  function loadCases() {
    loadCasesStats();
    if (casesView === 'kanban') loadCasesKanban();
    else loadCasesList();
  }

  async function openCaseDetail(id) {
    casesLoading = true;
    try {
      const res = await fetch(`/api/cases?action=detail&id=${id}`, { headers: { Authorization: `Bearer ${token}` } });
      const result = await res.json();
      caseDetail = result.case;
      caseNotes = result.notes || [];
      caseActivity = result.activity || [];
    } catch {}
    casesLoading = false;
  }

  function closeCaseDetail() { caseDetail = null; caseNotes = []; caseActivity = []; caseNewNote = ''; }

  async function updateCase(id, updates) {
    await fetch('/api/cases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ action: 'update', id, ...updates }),
    });
    if (caseDetail && caseDetail.id === id) {
      Object.assign(caseDetail, updates);
      caseDetail = caseDetail;
    }
    loadCases();
  }

  async function moveCaseStatus(id, newStatus) {
    await fetch('/api/cases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ action: 'move', id, status: newStatus }),
    });
    loadCases();
  }

  async function addCaseNote() {
    if (!caseNewNote.trim() || !caseDetail) return;
    caseNoteSaving = true;
    await fetch('/api/cases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ action: 'add_note', id: caseDetail.id, content: caseNewNote.trim() }),
    });
    caseNewNote = '';
    const res = await fetch(`/api/cases?action=detail&id=${caseDetail.id}`, { headers: { Authorization: `Bearer ${token}` } });
    const result = await res.json();
    caseNotes = result.notes || [];
    caseActivity = result.activity || [];
    caseNoteSaving = false;
  }

  async function createCase() {
    if (!newCase.fullName && !newCase.email) return;
    await fetch('/api/cases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ action: 'create', ...newCase }),
    });
    showCreateCase = false;
    newCase = { fullName: '', email: '', phone: '', source: 'manual', status: 'lead', assignedTo: '', priority: 'normal', followUpDate: '', nextSteps: '', estimatedValue: '', linkedApplicationId: null, linkedContactId: null, linkedLeadIds: [] };
    loadCases();
  }

  async function createCaseFromApplication() {
    if (!detailView) return;
    const d = detailView;
    // Load admin users for assignment if not loaded
    if (!adminUsers.length) {
      try {
        const result = await api('GET', { action: 'users' });
        adminUsers = result.users || [];
      } catch {}
    }
    newCase = {
      fullName: d.applicantFullName || '',
      email: d.personalEmail || '',
      phone: d.cellPhone || '',
      source: 'solicitud',
      status: 'lead',
      assignedTo: '',
      priority: d.priority || 'normal',
      followUpDate: '',
      nextSteps: '',
      estimatedValue: d.requestedCreditAmount ? `${d.requestedCurrency || 'USD'} ${fmtMoney(d.requestedCreditAmount)}` : '',
      linkedApplicationId: d.id,
      linkedContactId: null,
      linkedLeadIds: []
    };
    showCreateCaseFromDetail = true;
  }

  async function confirmCreateCaseFromDetail() {
    if (!newCase.fullName && !newCase.email) return;
    await fetch('/api/cases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ action: 'create', ...newCase }),
    });
    showCreateCaseFromDetail = false;
    newCase = { fullName: '', email: '', phone: '', source: 'manual', status: 'lead', assignedTo: '', priority: 'normal', followUpDate: '', nextSteps: '', estimatedValue: '', linkedApplicationId: null, linkedContactId: null, linkedLeadIds: [] };
  }

  let lookupTimeout;
  async function handleLookup() {
    clearTimeout(lookupTimeout);
    if (lookupQuery.length < 2) { lookupResults = []; return; }
    lookupTimeout = setTimeout(async () => {
      lookupLoading = true;
      try {
        const res = await fetch(`/api/cases?action=lookup&q=${encodeURIComponent(lookupQuery)}`, { headers: { Authorization: `Bearer ${token}` } });
        const result = await res.json();
        lookupResults = result.results || [];
      } catch { lookupResults = []; }
      lookupLoading = false;
    }, 300);
  }

  function linkLookupResult(result) {
    newCase.fullName = result.name || newCase.fullName;
    newCase.email = result.email || newCase.email;
    newCase.phone = result.phone || newCase.phone;
    newCase.source = result.source || 'manual';
    if (result.source === 'application') newCase.linkedApplicationId = result.id;
    if (result.source === 'contact') newCase.linkedContactId = result.id;
    if (result.source === 'lead') newCase.linkedLeadIds = [result.id];
    lookupResults = [];
    lookupQuery = '';
  }

  // ============================================
  // Formatters
  // ============================================
  function fmtDate(d) {
    if (!d) return '—';
    try {
      return new Date(d + (d.includes('Z') ? '' : 'Z')).toLocaleDateString(lang === 'en' ? 'en-US' : 'es-CR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return d; }
  }
  function fmtShortDate(d) {
    if (!d) return '—';
    try { return new Date(d + (d.includes('Z') ? '' : 'Z')).toLocaleDateString(lang === 'en' ? 'en-US' : 'es-CR', { day: '2-digit', month: 'short' }); } catch { return d; }
  }
  function fmtMoney(v) { return v ? `$${Number(v).toLocaleString()}` : '—'; }
  function fmtPct(a, b) { return b ? `${Math.round(a / b * 100)}%` : '0%'; }
  function statusLabel(s) { return t(s) || s; }

  // ============================================
  // Init
  // ============================================
  $: if (isLoggedIn && !stats && activeTab === 'dashboard') loadDashboard();
</script>

<div class="admin" class:admin--detail={detailView}>

  <!-- ======== LOGIN ======== -->
  {#if !isLoggedIn}
  <div class="login">
    <div class="login__card">
      <div class="login__brand"><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 937.11 141.63' class="login__logo-svg"><g><g><path fill='currentColor' d='M336.31,0h35.56C391.39,0,407.28,14.63,407.28,34.15s-13.69,31.63-26.91,34.15l24.39,41.86h-16.68l-22.82-40.44h-13.53v40.44h-15.42V0ZM371.87,55.86c11.96,0,19.98-9.76,19.98-21.72s-8.03-20.3-19.98-20.3h-20.14v42.02h20.14Z'/><path fill='currentColor' d='M416.72,70.81c0-22.5,18.25-40.6,40.6-40.6s40.44,18.1,40.44,40.6v39.34h-15.42v-12.43c-3.78,7.71-13.85,13.69-25.02,13.69-22.35,0-40.6-18.1-40.6-40.6ZM482.5,70.81c0-14.32-10.54-25.65-25.02-25.65s-25.34,11.33-25.34,25.65,11.02,25.65,25.34,25.65,25.02-11.33,25.02-25.65Z'/><path fill='currentColor' d='M553.94,30.21c22.35,0,40.6,18.1,40.6,40.6s-18.25,40.6-40.6,40.6c-10.54,0-19.04-4.41-24.86-11.33v41.54h-15.58v-70.81c0-22.5,18.1-40.6,40.44-40.6ZM579.12,70.81c0-14.32-10.7-25.65-25.18-25.65s-25.18,11.33-25.18,25.65,11.02,25.65,25.18,25.65,25.18-11.33,25.18-25.65Z'/><path fill='currentColor' d='M609.49,11.17c0-5.35,4.09-9.44,9.44-9.44s9.28,4.09,9.28,9.44-4.09,9.44-9.28,9.44-9.44-4.09-9.44-9.44ZM611.22,31.47h15.42v78.68h-15.42V31.47Z'/><path fill='currentColor' d='M756.3,0v110.15h-15.42V34.62l-34.15,75.53h-13.22l-34.15-75.53v75.53h-15.42V0h15.42l40.76,87.97L740.88,0h15.42Z'/><path fill='currentColor' d='M771.25,70.81c0-22.5,18.25-40.6,40.6-40.6s40.44,18.1,40.44,40.6v39.34h-15.42v-12.43c-3.78,7.71-13.85,13.69-25.02,13.69-22.35,0-40.6-18.1-40.6-40.6ZM837.03,70.81c0-14.32-10.54-25.65-25.02-25.65s-25.34,11.33-25.34,25.65,11.02,25.65,25.34,25.65,25.02-11.33,25.02-25.65Z'/><path fill='currentColor' d='M919.49,110.15l-20.3-28.17-20.3,28.17h-17.78l29.27-40.91-26.91-37.77h17.47l18.1,25.18,18.41-25.18h17.47l-26.91,37.77,29.11,40.91h-17.62Z'/></g><g><path fill='currentColor' d='M109.63,111.41h-21.98L27.86,51.57c-2.51-2.51-5.71-2.46-7.86-1.57-2.15.89-4.45,3.11-4.45,6.66v54.74H0v-54.74c0-9.38,5.39-17.44,14.05-21.03,8.67-3.59,18.17-1.7,24.8,4.94l19.41,19.43,31.98-31.95c2.51-2.51,2.46-5.71,1.57-7.86-.89-2.15-3.11-4.45-6.66-4.45H0V.19h85.15c9.38,0,17.44,5.38,21.03,14.05,3.59,8.67,1.69,18.17-4.94,24.8l-31.98,31.95,40.37,40.4Z'/><path fill='currentColor' d='M235.77,111.56h-15.79v-18.36c0-2.24-.87-4.34-2.46-5.93l-21.72-21.71-21.72,21.71c-1.58,1.58-2.46,3.69-2.46,5.93v18.36h-15.79v-12.74c0-7.68,0-14.94,5.79-20.72l23.36-23.35-38.16-38.19c-1.7-1.71-3.57-1.3-4.53-.9-.95.4-2.56,1.43-2.56,3.84v91.81h-15.29V19.5c0-8.02,4.6-14.9,12.01-17.97,7.41-3.06,15.53-1.45,21.2,4.22l38.16,38.19L233.91,5.76c5.67-5.68,13.8-7.3,21.21-4.23,7.41,3.07,12.01,9.95,12.01,17.97l-.04,91.76h-15.3l.05-91.76c0-2.41-1.61-3.44-2.57-3.84-.96-.4-2.82-.81-4.53.9l-38.13,38.19,23.36,23.35c5.79,5.78,5.79,13.04,5.79,20.72v12.74Z'/></g></g></svg></div>
      <h1>{t('login_title')}</h1>

      {#if loginMode === 'login'}
        <form on:submit|preventDefault={handleLogin}>
          <input type="email" placeholder="Email" bind:value={loginEmail} class="login__input" autofocus />
          <input type="password" placeholder={t('login_placeholder')} bind:value={passwordInput} class="login__input" style="margin-top:10px" />
          {#if loginError}<p class="login__error">{loginError}</p>{/if}
          <button type="submit" class="login__btn">{t('login_btn')}</button>
        </form>
        <button class="login__link" on:click={() => { loginMode = 'reset_request'; loginError = ''; resetMessage = ''; }}>¿Olvidaste tu contraseña?</button>
      {:else if loginMode === 'reset_request'}
        <form on:submit|preventDefault={handleResetRequest}>
          <p class="login__subtitle">Ingresá tu email para recibir un enlace de recuperación.</p>
          <input type="email" placeholder="Email" bind:value={loginEmail} class="login__input" autofocus />
          {#if loginError}<p class="login__error">{loginError}</p>{/if}
          {#if resetMessage}<p class="login__success">{resetMessage}</p>{/if}
          <button type="submit" class="login__btn">Enviar enlace</button>
        </form>
        <button class="login__link" on:click={() => { loginMode = 'login'; loginError = ''; resetMessage = ''; }}>← Volver al inicio de sesión</button>
      {:else if loginMode === 'reset_confirm'}
        <form on:submit|preventDefault={handleResetPassword}>
          <p class="login__subtitle">Ingresá tu nueva contraseña (mínimo 8 caracteres).</p>
          <input type="password" placeholder="Nueva contraseña" bind:value={newPassword} class="login__input" autofocus />
          {#if loginError}<p class="login__error">{loginError}</p>{/if}
          {#if resetMessage}<p class="login__success">{resetMessage}</p>{/if}
          <button type="submit" class="login__btn">Restablecer contraseña</button>
        </form>
        <button class="login__link" on:click={() => { loginMode = 'login'; loginError = ''; resetMessage = ''; }}>← Volver al inicio de sesión</button>
      {/if}
      <button class="login__lang" on:click={toggleLang}>{lang === 'es' ? 'English' : 'Español'}</button>
    </div>
  </div>

  {:else}
  <!-- ======== HEADER ======== -->
  <header class="header">
    <div class="header__left">
      <span class="header__brand"><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 937.11 141.63' class="header__logo-svg"><g><g><path fill='currentColor' d='M336.31,0h35.56C391.39,0,407.28,14.63,407.28,34.15s-13.69,31.63-26.91,34.15l24.39,41.86h-16.68l-22.82-40.44h-13.53v40.44h-15.42V0ZM371.87,55.86c11.96,0,19.98-9.76,19.98-21.72s-8.03-20.3-19.98-20.3h-20.14v42.02h20.14Z'/><path fill='currentColor' d='M416.72,70.81c0-22.5,18.25-40.6,40.6-40.6s40.44,18.1,40.44,40.6v39.34h-15.42v-12.43c-3.78,7.71-13.85,13.69-25.02,13.69-22.35,0-40.6-18.1-40.6-40.6ZM482.5,70.81c0-14.32-10.54-25.65-25.02-25.65s-25.34,11.33-25.34,25.65,11.02,25.65,25.34,25.65,25.02-11.33,25.02-25.65Z'/><path fill='currentColor' d='M553.94,30.21c22.35,0,40.6,18.1,40.6,40.6s-18.25,40.6-40.6,40.6c-10.54,0-19.04-4.41-24.86-11.33v41.54h-15.58v-70.81c0-22.5,18.1-40.6,40.44-40.6ZM579.12,70.81c0-14.32-10.7-25.65-25.18-25.65s-25.18,11.33-25.18,25.65,11.02,25.65,25.18,25.65,25.18-11.33,25.18-25.65Z'/><path fill='currentColor' d='M609.49,11.17c0-5.35,4.09-9.44,9.44-9.44s9.28,4.09,9.28,9.44-4.09,9.44-9.28,9.44-9.44-4.09-9.44-9.44ZM611.22,31.47h15.42v78.68h-15.42V31.47Z'/><path fill='currentColor' d='M756.3,0v110.15h-15.42V34.62l-34.15,75.53h-13.22l-34.15-75.53v75.53h-15.42V0h15.42l40.76,87.97L740.88,0h15.42Z'/><path fill='currentColor' d='M771.25,70.81c0-22.5,18.25-40.6,40.6-40.6s40.44,18.1,40.44,40.6v39.34h-15.42v-12.43c-3.78,7.71-13.85,13.69-25.02,13.69-22.35,0-40.6-18.1-40.6-40.6ZM837.03,70.81c0-14.32-10.54-25.65-25.02-25.65s-25.34,11.33-25.34,25.65,11.02,25.65,25.34,25.65,25.02-11.33,25.02-25.65Z'/><path fill='currentColor' d='M919.49,110.15l-20.3-28.17-20.3,28.17h-17.78l29.27-40.91-26.91-37.77h17.47l18.1,25.18,18.41-25.18h17.47l-26.91,37.77,29.11,40.91h-17.62Z'/></g><g><path fill='currentColor' d='M109.63,111.41h-21.98L27.86,51.57c-2.51-2.51-5.71-2.46-7.86-1.57-2.15.89-4.45,3.11-4.45,6.66v54.74H0v-54.74c0-9.38,5.39-17.44,14.05-21.03,8.67-3.59,18.17-1.7,24.8,4.94l19.41,19.43,31.98-31.95c2.51-2.51,2.46-5.71,1.57-7.86-.89-2.15-3.11-4.45-6.66-4.45H0V.19h85.15c9.38,0,17.44,5.38,21.03,14.05,3.59,8.67,1.69,18.17-4.94,24.8l-31.98,31.95,40.37,40.4Z'/><path fill='currentColor' d='M235.77,111.56h-15.79v-18.36c0-2.24-.87-4.34-2.46-5.93l-21.72-21.71-21.72,21.71c-1.58,1.58-2.46,3.69-2.46,5.93v18.36h-15.79v-12.74c0-7.68,0-14.94,5.79-20.72l23.36-23.35-38.16-38.19c-1.7-1.71-3.57-1.3-4.53-.9-.95.4-2.56,1.43-2.56,3.84v91.81h-15.29V19.5c0-8.02,4.6-14.9,12.01-17.97,7.41-3.06,15.53-1.45,21.2,4.22l38.16,38.19L233.91,5.76c5.67-5.68,13.8-7.3,21.21-4.23,7.41,3.07,12.01,9.95,12.01,17.97l-.04,91.76h-15.3l.05-91.76c0-2.41-1.61-3.44-2.57-3.84-.96-.4-2.82-.81-4.53.9l-38.13,38.19,23.36,23.35c5.79,5.78,5.79,13.04,5.79,20.72v12.74Z'/></g></g></svg></span>
      <span class="header__badge">Admin</span>
    </div>
    <div class="header__right">
      <button class="header__lang" on:click={toggleLang}>{lang === 'es' ? 'EN' : 'ES'}</button>
      {#if currentUser?.name}<span class="header__user">{currentUser.name}</span>{/if}
      <button class="header__logout" on:click={handleLogout}>{t('logout')}</button>
    </div>
  </header>

  <!-- ======== NAV ======== -->
  <nav class="nav">
    {#each tabs as tab}
      <button class="nav__tab" class:active={activeTab === tab.id} on:click={() => switchTab(tab.id)}>
        <span class="nav__icon">{tab.icon}</span>
        <span class="nav__label">{t(tab.id)}</span>
        {#if tab.id === activeTab && ['applications','contacts','leads'].includes(tab.id)}
          <span class="nav__count">{total}</span>
        {/if}
      </button>
    {/each}
  </nav>

  <main class="main">

    <!-- ======== DASHBOARD ======== -->
    {#if activeTab === 'dashboard'}
      {#if loading}
        <div class="empty">{t('loading')}</div>
      {:else if stats}
        <!-- KPI Cards -->
        <div class="kpi-grid">
          <div class="kpi kpi--gold">
            <div class="kpi__value">{stats.todayApplications}</div>
            <div class="kpi__label">{t('today')}</div>
          </div>
          <div class="kpi kpi--blue">
            <div class="kpi__value">{stats.weekApplications}</div>
            <div class="kpi__label">{t('this_week')}</div>
          </div>
          <div class="kpi kpi--teal">
            <div class="kpi__value">{stats.totalApplications}</div>
            <div class="kpi__label">{t('applications')}</div>
          </div>
          <div class="kpi kpi--purple">
            <div class="kpi__value">{fmtMoney(stats.pipelineValue)}</div>
            <div class="kpi__label">{t('pipeline_value')}</div>
          </div>
          <div class="kpi kpi--green">
            <div class="kpi__value">{stats.totalLeads}</div>
            <div class="kpi__label">{t('leads')}</div>
          </div>
          <div class="kpi kpi--gray">
            <div class="kpi__value">{fmtPct(stats.funnel?.approvedTotal || 0, stats.funnel?.appsTotal || 1)}</div>
            <div class="kpi__label">{t('conversion')}</div>
          </div>
          <div class="kpi" style="border-color:rgba(213,181,132,.2)">
            <div class="kpi__value" style="color:#d5b584">{fmtMoney(stats.avgAmount)}</div>
            <div class="kpi__label">Monto promedio</div>
          </div>
          <div class="kpi" style="border-color:rgba(91,143,217,.2)">
            <div class="kpi__value" style="color:#5b8fd9">{stats.avgResponseHours ? Math.round(stats.avgResponseHours) + 'h' : '—'}</div>
            <div class="kpi__label">Tiempo respuesta</div>
          </div>
          <div class="kpi" style="border-color:rgba(139,92,246,.2)">
            <div class="kpi__value" style="color:#8b5cf6">{stats.casesOverview?.active || 0}</div>
            <div class="kpi__label">{t('cases')} activos</div>
          </div>
        </div>

        <!-- Conversion Funnel Visual -->
        {#if stats.funnel}
          <section class="dash-card dash-card--wide" style="margin-bottom:16px">
            <h3>Embudo de conversión</h3>
            <div class="conv-funnel">
              <div class="conv-funnel__step">
                <div class="conv-funnel__bar" style="width:100%;background:#d5b584"></div>
                <div class="conv-funnel__label">Leads <strong>{stats.funnel.leadsTotal || 0}</strong></div>
              </div>
              <div class="conv-funnel__step">
                <div class="conv-funnel__bar" style="width:{Math.max(5, ((stats.funnel.appsTotal || 0) / Math.max(stats.funnel.leadsTotal || 1, 1)) * 100)}%;background:#5b8fd9"></div>
                <div class="conv-funnel__label">Solicitudes <strong>{stats.funnel.appsTotal || 0}</strong> <span class="conv-funnel__pct">{fmtPct(stats.funnel.appsTotal || 0, Math.max(stats.funnel.leadsTotal || 1, 1))}</span></div>
              </div>
              <div class="conv-funnel__step">
                <div class="conv-funnel__bar" style="width:{Math.max(5, ((stats.funnel.approvedTotal || 0) / Math.max(stats.funnel.leadsTotal || 1, 1)) * 100)}%;background:#22c55e"></div>
                <div class="conv-funnel__label">Aprobadas <strong>{stats.funnel.approvedTotal || 0}</strong> <span class="conv-funnel__pct">{fmtPct(stats.funnel.approvedTotal || 0, Math.max(stats.funnel.leadsTotal || 1, 1))}</span></div>
              </div>
              <div class="conv-funnel__step">
                <div class="conv-funnel__bar" style="width:{Math.max(5, ((stats.funnel.disbursedTotal || 0) / Math.max(stats.funnel.leadsTotal || 1, 1)) * 100)}%;background:#14b8a6"></div>
                <div class="conv-funnel__label">Desembolsadas <strong>{stats.funnel.disbursedTotal || 0}</strong> <span class="conv-funnel__pct">{fmtPct(stats.funnel.disbursedTotal || 0, Math.max(stats.funnel.leadsTotal || 1, 1))}</span></div>
              </div>
            </div>
          </section>
        {/if}

        <!-- Monthly Trend -->
        {#if (stats.monthlyTrend || []).length > 0}
          <section class="dash-card dash-card--wide" style="margin-bottom:16px">
            <h3>Tendencia mensual</h3>
            <div class="monthly-chart">
              {#each stats.monthlyTrend as m}
                <div class="monthly-chart__col">
                  <div class="monthly-chart__bar-wrap">
                    <div class="monthly-chart__bar" style="height:{Math.max(4, (m.count / Math.max(...stats.monthlyTrend.map(x => x.count), 1)) * 100)}%"></div>
                  </div>
                  <div class="monthly-chart__count">{m.count}</div>
                  <div class="monthly-chart__label">{m.month.slice(5)}</div>
                  <div class="monthly-chart__vol">{fmtMoney(m.volume)}</div>
                </div>
              {/each}
            </div>
          </section>
        {/if}

        <div class="dash-grid">
          <!-- Status Funnel -->
          <section class="dash-card">
            <h3>{t('status_funnel')}</h3>
            <div class="funnel">
              {#each (stats.byStatus || []) as s}
                <div class="funnel__row">
                  <span class="funnel__dot" style="background:{STATUS_COLORS[s.status] || '#888'}"></span>
                  <span class="funnel__label">{statusLabel(s.status)}</span>
                  <span class="funnel__bar-wrap">
                    <span class="funnel__bar" style="width:{Math.max(4, (s.count / (stats.totalApplications || 1)) * 100)}%; background:{STATUS_COLORS[s.status] || '#888'}"></span>
                  </span>
                  <span class="funnel__count">{s.count}</span>
                </div>
              {/each}
            </div>
          </section>

          <!-- Leads Trend (sparkline) -->
          <section class="dash-card">
            <h3>{t('leads_trend')}</h3>
            {#if (stats.leadsByDay || []).length > 1}
              {@const days = stats.leadsByDay}
              {@const maxV = Math.max(...days.map(d => d.count), 1)}
              <div class="spark">
                {#each days as d, i}
                  <div class="spark__bar-wrap" title="{d.day}: {d.count}">
                    <div class="spark__bar" style="height:{Math.max(4, (d.count/maxV)*100)}%"></div>
                  </div>
                {/each}
              </div>
            {:else}
              <p class="muted">Sin datos suficientes.</p>
            {/if}
          </section>

          <!-- By Province -->
          <section class="dash-card">
            <h3>{t('by_province')}</h3>
            <div class="province-list">
              {#each (stats.byProvince || []) as p}
                <div class="province-row">
                  <span>{p.province}</span>
                  <span class="province-count">{p.count}</span>
                </div>
              {/each}
              {#if !(stats.byProvince || []).length}
                <p class="muted">Sin datos.</p>
              {/if}
            </div>
          </section>

          <!-- Attention Needed -->
          <section class="dash-card dash-card--alert">
            <h3>⚠️ {t('attention_needed')}</h3>
            <p class="muted" style="margin-bottom:12px">{t('attention_desc')}</p>
            {#each (stats.attention || []) as app}
              <div class="attn-row" on:click={() => { switchTab('applications'); setTimeout(() => openDetail('applications', app.id), 300); }}>
                <span class="attn-name">{app.applicantFullName || '—'}</span>
                <span class="attn-amount">{fmtMoney(app.requestedCreditAmount)}</span>
                <span class="attn-date">{fmtShortDate(app.createdAt)}</span>
              </div>
            {/each}
            {#if !(stats.attention || []).length}
              <p class="muted" style="color:#22c55e">✓ Todo al día</p>
            {/if}
          </section>

          <!-- Recent Activity -->
          <section class="dash-card dash-card--wide">
            <h3>{t('recent_activity')}</h3>
            <div class="activity-feed">
              {#each (stats.recentActivity || []).slice(0, 12) as act}
                <div class="activity-item">
                  <span class="activity-dot" style="background:{STATUS_COLORS[act.newValue] || '#6b7280'}"></span>
                  <span class="activity-text">
                    <strong>{t(act.action)}</strong>
                    {#if act.action === 'status_changed'}
                      {statusLabel(act.oldValue)} → {statusLabel(act.newValue)}
                    {:else if act.newValue}
                      — {act.newValue.length > 60 ? act.newValue.slice(0,60)+'...' : act.newValue}
                    {/if}
                    <span class="activity-meta">#{act.recordId} · {fmtShortDate(act.createdAt)}</span>
                  </span>
                </div>
              {/each}
            </div>
          </section>
        </div>
      {/if}

    <!-- ======== DETAIL VIEW ======== -->
    {:else if detailView}
      <button class="back-btn" on:click={closeDetail}>← {t('back')}</button>

      <div class="detail">
        <div class="detail__header">
          <div>
            <h2>{detailView.applicantFullName || detailView.fullName || detailView.email || '—'}</h2>
            <p class="detail__sub">#{detailView.id} · {fmtDate(detailView.createdAt)}</p>
          </div>
          <div class="detail__actions">
            {#if detailView.cellPhone || detailView.phone}
              <button class="action-btn action-btn--wa" on:click={() => openWhatsApp(detailView.cellPhone || detailView.phone)}>💬 {t('whatsapp')}</button>
              <button class="action-btn action-btn--call" on:click={() => openCall(detailView.cellPhone || detailView.phone)}>📞 {t('call')}</button>
            {/if}
            {#if detailView.personalEmail || detailView.email}
              <button class="action-btn action-btn--email" on:click={() => openEmail(detailView.personalEmail || detailView.email)}>✉️ {t('send_email')}</button>
            {/if}
            <button class="action-btn action-btn--case" on:click={createCaseFromApplication}>🗂️ Crear caso</button>
          </div>
        </div>

        <div class="detail__controls">
          <label>
            <span class="detail__label">{t('status')}</span>
            <select class="status-sel" value={detailView.status} on:change={e => changeStatus(detailView.type, detailView.id, e.target.value)}>
              {#each STATUS_LIST as s}<option value={s}>{statusLabel(s)}</option>{/each}
            </select>
          </label>
          {#if detailView.type === 'applications'}
            <label>
              <span class="detail__label">{t('priority')}</span>
              <select class="priority-sel" value={detailView.priority || 'normal'} on:change={e => changePriority(detailView.id, e.target.value)}>
                {#each PRIORITY_LIST as p}<option value={p}>{t(p)}</option>{/each}
              </select>
            </label>
          {/if}
        </div>

        {#if detailView.type === 'applications'}
          <div class="detail__sections">
            <section class="detail__section">
              <h4>{t('applicant_info')}</h4>
              <div class="detail__grid">
                <div><span class="lbl">{t('name')}</span><span>{detailView.applicantFullName || '—'}</span></div>
                <div><span class="lbl">{t('id_number')}</span><span>{detailView.applicantIdType} {detailView.applicantIdNumber || '—'}</span></div>
                <div><span class="lbl">{t('phone')}</span><span>{detailView.cellPhone || '—'}</span></div>
                <div><span class="lbl">{t('email')}</span><span>{detailView.personalEmail || '—'}</span></div>
                <div><span class="lbl">Facilidad crediticia</span><span>{detailView.creditFacilityType || '—'}</span></div>
                <div><span class="lbl">{t('amount')}</span><span>{detailView.requestedCurrency || 'USD'} {fmtMoney(detailView.requestedCreditAmount)}</span></div>
                <div><span class="lbl">{t('term')}</span><span>{detailView.requestedTermMonths || '—'} meses</span></div>
                <div><span class="lbl">Estado civil</span><span>{detailView.maritalStatus || '—'}</span></div>
                <div><span class="lbl">Nacionalidad</span><span>{detailView.nationality || '—'}</span></div>
                <div><span class="lbl">Profesión</span><span>{detailView.profession || '—'}</span></div>
                <div><span class="lbl">Nacimiento</span><span>{detailView.birthDate || '—'}</span></div>
                <div><span class="lbl">Lugar nacimiento</span><span>{detailView.birthPlace || '—'}</span></div>
                <div><span class="lbl">Prov. nacimiento</span><span>{detailView.birthProvince || '—'}</span></div>
                <div><span class="lbl">Cantón nacimiento</span><span>{detailView.birthCanton || '—'}</span></div>
                <div><span class="lbl">Barrio</span><span>{detailView.neighborhood || '—'}</span></div>
              </div>
            </section>
            {#if detailRapiId}
              <section class="detail__section">
                <h4>⚡ Rapi-ID Check</h4>
                <div class="cedula-images">
                  {#if detailRapiId.r2Front}
                    <div class="cedula-img-box">
                      <span class="cedula-img-label">Frente</span>
                      <img src="/api/admin?action=cedula_image&key={encodeURIComponent(detailRapiId.r2Front)}&token={token}" alt="Cédula frente" class="cedula-img" />
                    </div>
                  {/if}
                  {#if detailRapiId.r2Back}
                    <div class="cedula-img-box">
                      <span class="cedula-img-label">Reverso</span>
                      <img src="/api/admin?action=cedula_image&key={encodeURIComponent(detailRapiId.r2Back)}&token={token}" alt="Cédula reverso" class="cedula-img" />
                    </div>
                  {/if}
                </div>
                <div class="detail__grid" style="margin-top: 8px;">
                  <div><span class="lbl">Campos detectados</span><span>{detailRapiId.detected || '—'}</span></div>
                </div>
              </section>
            {/if}
            <section class="detail__section">
              <h4>{t('address_info')}</h4>
              <div class="detail__grid">
                <div><span class="lbl">Provincia</span><span>{detailView.homeProvince || '—'}</span></div>
                <div><span class="lbl">Cantón</span><span>{detailView.homeCanton || '—'}</span></div>
                <div><span class="lbl">Tipo residencia</span><span>{detailView.residenceType || '—'}</span></div>
                <div><span class="lbl">Pago vivienda</span><span>{fmtMoney(detailView.housingPayment)}</span></div>
                <div class="detail__grid--full"><span class="lbl">Dirección exacta</span><span>{detailView.exactHomeAddress || detailView.homeAddress || '—'}</span></div>
              </div>
            </section>
            <section class="detail__section">
              <h4>{t('employment_info')}</h4>
              <div class="detail__grid">
                <div><span class="lbl">Empleador</span><span>{detailView.employerName || '—'}</span></div>
                <div><span class="lbl">Ocupación</span><span>{detailView.occupation || '—'}</span></div>
                <div><span class="lbl">Ingreso bruto</span><span>{fmtMoney(detailView.grossMonthlyIncome)}</span></div>
                <div><span class="lbl">Inicio laboral</span><span>{detailView.employmentStartDate || '—'}</span></div>
                <div><span class="lbl">Teléfono trabajo</span><span>{detailView.workPhone || '—'}</span></div>
                <div><span class="lbl">Email trabajo</span><span>{detailView.workEmail || '—'}</span></div>
                <div><span class="lbl">Barrio trabajo</span><span>{detailView.workNeighborhood || '—'}</span></div>
              </div>
            </section>
            {#if detailView.spouseFullName}
              <section class="detail__section">
                <h4>{t('spouse_info')}</h4>
                <div class="detail__grid">
                  <div><span class="lbl">{t('name')}</span><span>{detailView.spouseFullName}</span></div>
                  <div><span class="lbl">Ingreso</span><span>{fmtMoney(detailView.spouseGrossMonthlyIncome)}</span></div>
                  <div><span class="lbl">Profesión</span><span>{detailView.spouseProfession || '—'}</span></div>
                </div>
              </section>
            {/if}
            <section class="detail__section">
              <h4>{t('references_info')}</h4>
              <div class="detail__grid">
                <div><span class="lbl">Ref. 1</span><span>{detailView.reference1Name || '—'} ({detailView.reference1Phone || '—'})</span></div>
                <div><span class="lbl">Parentesco</span><span>{detailView.reference1Relationship || '—'}</span></div>
                <div><span class="lbl">Ref. 2</span><span>{detailView.reference2Name || '—'} ({detailView.reference2Phone || '—'})</span></div>
                <div><span class="lbl">Parentesco</span><span>{detailView.reference2Relationship || '—'}</span></div>
              </div>
            </section>
          </div>
        {:else if detailView.type === 'contacts'}
          <div class="detail__sections">
            <section class="detail__section">
              <div class="detail__grid">
                <div><span class="lbl">{t('name')}</span><span>{detailView.fullName || '—'}</span></div>
                <div><span class="lbl">{t('email')}</span><span>{detailView.email || '—'}</span></div>
                <div><span class="lbl">{t('phone')}</span><span>{detailView.phone || '—'}</span></div>
                <div class="detail__grid--full"><span class="lbl">{t('message')}</span><span style="white-space:pre-wrap">{detailView.message || '—'}</span></div>
              </div>
            </section>
          </div>
        {/if}

        <!-- Create Case from Detail -->
        {#if showCreateCaseFromDetail}
          <section class="detail__section case-create-inline">
            <h4>🗂️ Crear caso desde esta solicitud</h4>
            <div class="detail__grid">
              <div><span class="lbl">Nombre</span><span>{newCase.fullName}</span></div>
              <div><span class="lbl">Email</span><span>{newCase.email}</span></div>
              <div><span class="lbl">Teléfono</span><span>{newCase.phone}</span></div>
              <div><span class="lbl">Valor</span><span>{newCase.estimatedValue}</span></div>
            </div>
            <div class="case-create-fields">
              <label>
                <span class="lbl">Asignar a</span>
                <select bind:value={newCase.assignedTo} class="user-input">
                  <option value="">Sin asignar</option>
                  {#each adminUsers.filter(u => u.isActive) as u}
                    <option value={u.email}>{u.name} ({u.role})</option>
                  {/each}
                </select>
              </label>
              <label>
                <span class="lbl">Prioridad</span>
                <select bind:value={newCase.priority} class="user-input">
                  <option value="normal">Normal</option>
                  <option value="alta">Alta</option>
                  <option value="urgente">Urgente</option>
                </select>
              </label>
              <label>
                <span class="lbl">Seguimiento</span>
                <input type="date" bind:value={newCase.followUpDate} class="user-input" />
              </label>
              <label class="full-width">
                <span class="lbl">Próximos pasos</span>
                <input type="text" bind:value={newCase.nextSteps} placeholder="Ej: Verificar documentos, llamar al cliente..." class="user-input" />
              </label>
            </div>
            <div style="display:flex; gap:10px; margin-top:12px;">
              <button class="save-btn" on:click={confirmCreateCaseFromDetail}>✅ Crear caso</button>
              <button class="cancel-btn" on:click={() => { showCreateCaseFromDetail = false; }}>Cancelar</button>
            </div>
          </section>
        {/if}

        <!-- Notes -->
        <section class="detail__section">
          <h4>{t('notes')} ({detailNotes.length})</h4>
          <form class="note-form" on:submit|preventDefault={addNote}>
            <textarea bind:value={newNoteText} placeholder={t('note_placeholder')} rows="2"></textarea>
            <button type="submit" class="note-submit" disabled={noteSaving || !newNoteText.trim()}>
              {noteSaving ? '...' : t('add_note')}
            </button>
          </form>
          <div class="notes-list">
            {#each detailNotes as note}
              <div class="note-item">
                <div class="note-meta">{note.author} · {fmtDate(note.createdAt)}</div>
                <div class="note-content">{note.content}</div>
              </div>
            {/each}
          </div>
        </section>

        <!-- Activity Timeline -->
        <section class="detail__section">
          <h4>{t('history')} ({detailActivity.length})</h4>
          <div class="timeline">
            {#each detailActivity as act}
              <div class="timeline-item">
                <span class="timeline-dot" style="background:{STATUS_COLORS[act.newValue] || '#6b7280'}"></span>
                <div>
                  <strong>{t(act.action)}</strong>
                  {#if act.action === 'status_changed'} {statusLabel(act.oldValue)} → {statusLabel(act.newValue)}{/if}
                  {#if act.action === 'note_added'} — {act.newValue?.slice(0,80)}{act.newValue?.length > 80 ? '...' : ''}{/if}
                  <div class="timeline-meta">{act.actor} · {fmtDate(act.createdAt)}</div>
                </div>
              </div>
            {/each}
          </div>
        </section>
      </div>

    <!-- ======== LIST VIEWS ======== -->
    {:else if ['applications', 'contacts', 'leads'].includes(activeTab)}
      <!-- Toolbar -->
      <div class="toolbar">
        <input type="search" class="toolbar__search" placeholder={t('search_placeholder')} bind:value={searchQuery} on:input={handleSearch} />
        <div class="toolbar__filters">
          {#if activeTab !== 'leads'}
            <select class="toolbar__select" bind:value={filterStatus} on:change={applyFilters}>
              <option value="">{t('all')} {t('status').toLowerCase()}</option>
              {#each STATUS_LIST as s}<option value={s}>{statusLabel(s)}</option>{/each}
            </select>
          {/if}
          {#if activeTab === 'applications'}
            <select class="toolbar__select" bind:value={filterPriority} on:change={applyFilters}>
              <option value="">{t('all')} {t('priority').toLowerCase()}</option>
              {#each PRIORITY_LIST as p}<option value={p}>{t(p)}</option>{/each}
            </select>
          {/if}
          <input type="date" class="toolbar__date" bind:value={dateFrom} on:change={applyFilters} title={t('from_date')} />
          <input type="date" class="toolbar__date" bind:value={dateTo} on:change={applyFilters} title={t('to_date')} />
          <button class="toolbar__export" on:click={exportCSV}>{t('export_csv')}</button>
        </div>
      </div>

      {#if loading}
        <div class="empty">{t('loading')}</div>
      {:else if data.length === 0}
        <div class="empty">{t('no_records')}</div>
      {:else}
        <div class="table-wrap">
          <table class="table">
            <thead>
              {#if activeTab === 'applications'}
                <tr>
                  <th class="sortable" on:click={() => toggleSort('created_at')}>{t('date')} {sortBy==='created_at' ? (sortDir==='desc'?'↓':'↑') : ''}</th>
                  <th class="sortable" on:click={() => toggleSort('applicant_full_name')}>{t('name')} {sortBy==='applicant_full_name' ? (sortDir==='desc'?'↓':'↑') : ''}</th>
                  <th>{t('id_number')}</th>
                  <th class="sortable" on:click={() => toggleSort('requested_credit_amount')}>{t('amount')} {sortBy==='requested_credit_amount' ? (sortDir==='desc'?'↓':'↑') : ''}</th>
                  <th>{t('term')}</th>
                  <th>{t('phone')}</th>
                  <th>{t('status')}</th>
                  <th>{t('priority')}</th>
                  <th>{t('actions')}</th>
                </tr>
              {:else if activeTab === 'contacts'}
                <tr>
                  <th class="sortable" on:click={() => toggleSort('created_at')}>{t('date')}</th>
                  <th class="sortable" on:click={() => toggleSort('full_name')}>{t('name')}</th>
                  <th>{t('email')}</th>
                  <th>{t('phone')}</th>
                  <th>{t('message')}</th>
                  <th>{t('status')}</th>
                  <th>{t('actions')}</th>
                </tr>
              {:else}
                <tr>
                  <th class="sortable" on:click={() => toggleSort('created_at')}>{t('date')}</th>
                  <th>{t('name')}</th>
                  <th class="sortable" on:click={() => toggleSort('email')}>{t('email')}</th>
                  <th>{t('phone')}</th>
                  <th>{t('vehicle_type')}</th>
                  <th>{t('value')}</th>
                  <th>{t('down_payment')}</th>
                  <th>{t('term')}</th>
                  <th>{t('monthly')}</th>
                </tr>
              {/if}
            </thead>
            <tbody>
              {#each data as item}
                {#if activeTab === 'applications'}
                  <tr class="row--click" on:click={() => openDetail('applications', item.id)}>
                    <td>{fmtShortDate(item.createdAt)}</td>
                    <td class="cell--name">{item.applicantFullName || '—'}</td>
                    <td>{item.applicantIdNumber || '—'}</td>
                    <td>{fmtMoney(item.requestedCreditAmount)}</td>
                    <td>{item.requestedTermMonths || '—'}m</td>
                    <td>{item.cellPhone || '—'}</td>
                    <td>
                      <select class="inline-sel" style="color:{STATUS_COLORS[item.status]}" value={item.status}
                        on:click|stopPropagation on:change={e => changeStatus('applications', item.id, e.target.value)}>
                        {#each STATUS_LIST as s}<option value={s}>{statusLabel(s)}</option>{/each}
                      </select>
                    </td>
                    <td>
                      <span class="priority-badge" style="color:{PRIORITY_COLORS[item.priority || 'normal']}">{t(item.priority || 'normal')}</span>
                    </td>
                    <td class="cell--actions" on:click|stopPropagation>
                      {#if item.cellPhone}<button class="mini-btn" title="WhatsApp" on:click={() => openWhatsApp(item.cellPhone)}>💬</button>{/if}
                      {#if item.cellPhone}<button class="mini-btn" title={t('call')} on:click={() => openCall(item.cellPhone)}>📞</button>{/if}
                      <button class="mini-btn" title={t('detail')} on:click={() => openDetail('applications', item.id)}>👁️</button>
                    </td>
                  </tr>
                {:else if activeTab === 'contacts'}
                  <tr class="row--click" on:click={() => openDetail('contacts', item.id)}>
                    <td>{fmtShortDate(item.createdAt)}</td>
                    <td class="cell--name">{item.fullName || '—'}</td>
                    <td>{item.email || '—'}</td>
                    <td>{item.phone || '—'}</td>
                    <td class="cell--msg">{item.message || '—'}</td>
                    <td>
                      <select class="inline-sel" style="color:{STATUS_COLORS[item.status]}" value={item.status}
                        on:click|stopPropagation on:change={e => changeStatus('contacts', item.id, e.target.value)}>
                        {#each STATUS_LIST as s}<option value={s}>{statusLabel(s)}</option>{/each}
                      </select>
                    </td>
                    <td class="cell--actions" on:click|stopPropagation>
                      <button class="mini-btn" title={t('detail')} on:click={() => openDetail('contacts', item.id)}>👁️</button>
                    </td>
                  </tr>
                {:else}
                  <tr>
                    <td>{fmtShortDate(item.createdAt)}</td>
                    <td class="cell--name">{item.fullName || '—'}</td>
                    <td>{item.email || '—'}</td>
                    <td>{item.phone || '—'}</td>
                    <td>{item.vehicleType || '—'}</td>
                    <td>{item.currency === 'CRC' ? '₡' : '$'}{item.vehicleValue ? Number(item.vehicleValue).toLocaleString() : '—'}</td>
                    <td>{item.currency === 'CRC' ? '₡' : '$'}{item.downPayment ? Number(item.downPayment).toLocaleString() : '—'}</td>
                    <td>{item.termMonths || '—'}m</td>
                    <td>{item.currency === 'CRC' ? '₡' : '$'}{item.monthlyPayment ? Math.round(item.monthlyPayment).toLocaleString() : '—'}</td>
                  </tr>
                {/if}
              {/each}
            </tbody>
          </table>
        </div>

        {#if totalPages > 1}
          <div class="pagination">
            <button disabled={page <= 1} on:click={() => goPage(page - 1)}>{t('prev')}</button>
            <span>{t('page_of').replace('{page}', page).replace('{total}', totalPages)}</span>
            <button disabled={page >= totalPages} on:click={() => goPage(page + 1)}>{t('next')}</button>
          </div>
        {/if}
      {/if}

    <!-- ======== CASES CRM ======== -->
    {:else if activeTab === 'cases'}
      {#if caseDetail}
        <!-- Case Detail View -->
        <button class="back-btn" on:click={closeCaseDetail}>← {t('back')}</button>
        <div class="detail">
          <div class="detail__header">
            <div>
              <h2>{caseDetail.fullName || caseDetail.email || '—'}</h2>
              <p class="detail__sub">#{caseDetail.id} · {t('source_label')}: {caseDetail.source || '—'} · {fmtDate(caseDetail.createdAt)}</p>
            </div>
            <div class="detail__actions">
              {#if caseDetail.phone}
                <button class="action-btn action-btn--wa" on:click={() => openWhatsApp(caseDetail.phone)}>💬 {t('whatsapp')}</button>
                <button class="action-btn action-btn--call" on:click={() => openCall(caseDetail.phone)}>📞 {t('call')}</button>
              {/if}
              {#if caseDetail.email}
                <button class="action-btn action-btn--email" on:click={() => openEmail(caseDetail.email)}>✉️ {t('send_email')}</button>
              {/if}
            </div>
          </div>
          <div class="detail__controls">
            <label><span class="detail__label">{t('status')}</span>
              <select class="status-sel" value={caseDetail.status} on:change={e => updateCase(caseDetail.id, { status: e.target.value })}>
                {#each CASE_STATUSES as s}<option value={s}>{t(s) || s}</option>{/each}
              </select></label>
            <label><span class="detail__label">{t('priority')}</span>
              <select class="priority-sel" value={caseDetail.priority || 'normal'} on:change={e => updateCase(caseDetail.id, { priority: e.target.value })}>
                {#each PRIORITY_LIST as p}<option value={p}>{t(p)}</option>{/each}
              </select></label>
            <label><span class="detail__label">{t('assigned_to')}</span>
              <input type="text" class="status-sel" value={caseDetail.assignedTo || ''} placeholder="Nombre..."
                on:change={e => updateCase(caseDetail.id, { assignedTo: e.target.value })} /></label>
            <label><span class="detail__label">{t('follow_up')}</span>
              <input type="date" class="status-sel" value={caseDetail.followUpDate || ''}
                on:change={e => updateCase(caseDetail.id, { followUpDate: e.target.value })} /></label>
          </div>
          <div class="detail__sections">
            <section class="detail__section">
              <h4>{t('case_detail')}</h4>
              <div class="detail__grid">
                <div><span class="lbl">{t('name')}</span><span>{caseDetail.fullName || '—'}</span></div>
                <div><span class="lbl">{t('email')}</span><span>{caseDetail.email || '—'}</span></div>
                <div><span class="lbl">{t('phone')}</span><span>{caseDetail.phone || '—'}</span></div>
                <div><span class="lbl">{t('source_label')}</span><span>{caseDetail.source || '—'}</span></div>
                <div><span class="lbl">{t('estimated_value_label')}</span><span>{caseDetail.estimatedValue ? fmtMoney(caseDetail.estimatedValue) : '—'}</span></div>
                <div class="detail__grid--full"><span class="lbl">{t('next_steps_label')}</span>
                  <textarea rows="2" value={caseDetail.nextSteps || ''} style="width:100%;padding:8px 12px;border-radius:8px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);color:#fff;font-size:.85rem;font-family:inherit;resize:vertical;"
                    on:change={e => updateCase(caseDetail.id, { nextSteps: e.target.value })}></textarea>
                </div>
              </div>
            </section>
          </div>
          <section class="detail__section">
            <h4>{t('notes')} ({caseNotes.length})</h4>
            <form class="note-form" on:submit|preventDefault={addCaseNote}>
              <textarea bind:value={caseNewNote} placeholder={t('note_placeholder')} rows="2"></textarea>
              <button type="submit" class="note-submit" disabled={caseNoteSaving || !caseNewNote.trim()}>{caseNoteSaving ? '...' : t('add_note')}</button>
            </form>
            <div class="notes-list">
              {#each caseNotes as note}
                <div class="note-item"><div class="note-meta">{note.author} · {fmtDate(note.createdAt)}</div><div class="note-content">{note.content}</div></div>
              {/each}
            </div>
          </section>
          <section class="detail__section">
            <h4>{t('history')} ({caseActivity.length})</h4>
            <div class="timeline">
              {#each caseActivity as act}
                <div class="timeline-item"><span class="timeline-dot" style="background:{CASE_STATUS_COLORS[act.newValue] || '#6b7280'}"></span>
                  <div><strong>{t(act.action) || act.action}</strong> {act.oldValue ? `${act.oldValue} → ${act.newValue}` : (act.newValue || '')}
                    <div class="timeline-meta">{act.actor} · {fmtDate(act.createdAt)}</div></div>
                </div>
              {/each}
            </div>
          </section>
        </div>

      {:else}
        <!-- Cases header with view toggle + create -->
        <div class="toolbar" style="margin-bottom:12px">
          <div style="display:flex;gap:6px">
            <button class="cms-tab" class:active={casesView === 'kanban'} on:click={() => { casesView = 'kanban'; loadCasesKanban(); }}>🗂️ {t('view_kanban')}</button>
            <button class="cms-tab" class:active={casesView === 'list'} on:click={() => { casesView = 'list'; loadCasesList(); }}>📋 {t('view_list')}</button>
          </div>
          {#if casesStats}
            <div style="display:flex;gap:16px;font-size:.82rem;color:rgba(255,246,226,.5)">
              <span>{t('total')}: <strong style="color:#d5b584">{casesStats.total}</strong></span>
              <span>{t('overdue')}: <strong style="color:#ef4444">{casesStats.overdue}</strong></span>
              <span>{t('unassigned')}: <strong style="color:#f59e0b">{casesStats.unassigned}</strong></span>
            </div>
          {/if}
          <button class="save-btn" on:click={() => showCreateCase = !showCreateCase}>{showCreateCase ? t('cancel') : '+ ' + t('create_case')}</button>
        </div>

        <!-- Create Case form -->
        {#if showCreateCase}
          <div class="content-add" style="margin-bottom:16px">
            <h4 style="margin:0 0 12px;font-size:.9rem">{t('create_case')}</h4>
            <div style="margin-bottom:12px">
              <input type="search" class="toolbar__search" placeholder={t('lookup_placeholder')} bind:value={lookupQuery} on:input={handleLookup} style="width:100%;margin-bottom:8px" />
              {#if lookupResults.length}
                <div style="border:1px solid rgba(255,255,255,.1);border-radius:10px;overflow:hidden;max-height:180px;overflow-y:auto">
                  {#each lookupResults as r}
                    <button style="display:flex;justify-content:space-between;width:100%;padding:10px 14px;background:rgba(255,255,255,.03);border:none;border-bottom:1px solid rgba(255,255,255,.05);color:#e8e4dc;cursor:pointer;text-align:left;font-size:.82rem" on:click={() => linkLookupResult(r)}>
                      <span><strong>{r.name || '—'}</strong> · {r.email || '—'}</span>
                      <span style="color:rgba(255,246,226,.4)">{r.source} · {fmtShortDate(r.createdAt)}</span>
                    </button>
                  {/each}
                </div>
              {/if}
            </div>
            <div class="content-add__grid">
              <label class="settings__field"><span>{t('name')}</span><input type="text" bind:value={newCase.fullName} /></label>
              <label class="settings__field"><span>{t('email')}</span><input type="email" bind:value={newCase.email} /></label>
              <label class="settings__field"><span>{t('phone')}</span><input type="tel" bind:value={newCase.phone} /></label>
              <label class="settings__field"><span>{t('assigned_to')}</span><input type="text" bind:value={newCase.assignedTo} placeholder="Nombre..." /></label>
              <label class="settings__field"><span>{t('priority')}</span>
                <select bind:value={newCase.priority}>{#each PRIORITY_LIST as p}<option value={p}>{t(p)}</option>{/each}</select></label>
              <label class="settings__field"><span>{t('follow_up')}</span><input type="date" bind:value={newCase.followUpDate} /></label>
              <label class="settings__field settings__field--full"><span>{t('next_steps_label')}</span><textarea rows="2" bind:value={newCase.nextSteps}></textarea></label>
            </div>
            <button class="save-btn" style="margin-top:12px" on:click={createCase}>{t('save')}</button>
          </div>
        {/if}

        {#if casesLoading}
          <div class="empty">{t('loading')}</div>

        <!-- KANBAN VIEW -->
        {:else if casesView === 'kanban'}
          <div class="kanban">
            {#each CASE_STATUSES as status}
              <div class="kanban__col">
                <div class="kanban__col-header" style="border-bottom-color:{CASE_STATUS_COLORS[status]}">
                  <span>{t(status) || status}</span>
                  <span class="kanban__count">{(casesKanban[status] || []).length}</span>
                </div>
                <div class="kanban__cards">
                  {#each (casesKanban[status] || []) as c}
                    <div class="kanban__card" on:click={() => openCaseDetail(c.id)} on:keydown={e => e.key === 'Enter' && openCaseDetail(c.id)} role="button" tabindex="0">
                      <div class="kanban__card-name">{c.fullName || c.email || '—'}</div>
                      <div class="kanban__card-meta">
                        {#if c.estimatedValue}<span>{fmtMoney(c.estimatedValue)}</span>{/if}
                        {#if c.source}<span class="kanban__source">{c.source}</span>{/if}
                      </div>
                      {#if c.assignedTo}<div class="kanban__card-assigned">→ {c.assignedTo}</div>{/if}
                      {#if c.followUpDate}
                        <div class="kanban__card-followup" class:overdue={c.followUpDate < new Date().toISOString().slice(0,10)}>
                          📅 {fmtShortDate(c.followUpDate)}
                        </div>
                      {/if}
                      <div class="kanban__card-actions">
                        {#if CASE_STATUSES.indexOf(status) > 0}
                          <button class="mini-btn" title="← Mover atrás" on:click|stopPropagation={() => moveCaseStatus(c.id, CASE_STATUSES[CASE_STATUSES.indexOf(status) - 1])}>←</button>
                        {/if}
                        {#if CASE_STATUSES.indexOf(status) < CASE_STATUSES.length - 1}
                          <button class="mini-btn" title="Mover →" on:click|stopPropagation={() => moveCaseStatus(c.id, CASE_STATUSES[CASE_STATUSES.indexOf(status) + 1])}>→</button>
                        {/if}
                      </div>
                    </div>
                  {/each}
                </div>
              </div>
            {/each}
          </div>

        <!-- LIST VIEW -->
        {:else}
          <div class="toolbar" style="margin-top:0">
            <input type="search" class="toolbar__search" placeholder={t('search_placeholder')} bind:value={searchQuery} on:input={() => { casesPage = 1; loadCasesList(); }} />
            <div class="toolbar__filters">
              <select class="toolbar__select" bind:value={filterStatus} on:change={() => { casesPage = 1; loadCasesList(); }}>
                <option value="">{t('all')} {t('status').toLowerCase()}</option>
                {#each CASE_STATUSES as s}<option value={s}>{t(s) || s}</option>{/each}
              </select>
              <select class="toolbar__select" bind:value={filterPriority} on:change={() => { casesPage = 1; loadCasesList(); }}>
                <option value="">{t('all')} {t('priority').toLowerCase()}</option>
                {#each PRIORITY_LIST as p}<option value={p}>{t(p)}</option>{/each}
              </select>
            </div>
          </div>
          {#if casesList.length === 0}
            <div class="empty">{t('no_records')}</div>
          {:else}
            <div class="table-wrap">
              <table class="table">
                <thead><tr>
                  <th>{t('date')}</th><th>{t('name')}</th><th>{t('email')}</th><th>{t('phone')}</th>
                  <th>{t('source_label')}</th><th>{t('status')}</th><th>{t('priority')}</th>
                  <th>{t('assigned_to')}</th><th>{t('follow_up')}</th><th>{t('actions')}</th>
                </tr></thead>
                <tbody>
                  {#each casesList as c}
                    <tr class="row--click" on:click={() => openCaseDetail(c.id)}>
                      <td>{fmtShortDate(c.updatedAt || c.createdAt)}</td>
                      <td class="cell--name">{c.fullName || '—'}</td>
                      <td>{c.email || '—'}</td>
                      <td>{c.phone || '—'}</td>
                      <td><span class="cat-badge">{c.source || '—'}</span></td>
                      <td><select class="inline-sel" style="color:{CASE_STATUS_COLORS[c.status]}" value={c.status}
                        on:click|stopPropagation on:change={e => moveCaseStatus(c.id, e.target.value)}>
                        {#each CASE_STATUSES as s}<option value={s}>{t(s) || s}</option>{/each}
                      </select></td>
                      <td><span class="priority-badge" style="color:{PRIORITY_COLORS[c.priority || 'normal']}">{t(c.priority || 'normal')}</span></td>
                      <td>{c.assignedTo || '—'}</td>
                      <td class:overdue={c.followUpDate && c.followUpDate < new Date().toISOString().slice(0,10)}>{c.followUpDate ? fmtShortDate(c.followUpDate) : '—'}</td>
                      <td class="cell--actions" on:click|stopPropagation>
                        {#if c.phone}<button class="mini-btn" title="WhatsApp" on:click={() => openWhatsApp(c.phone)}>💬</button>{/if}
                        <button class="mini-btn" title={t('detail')} on:click={() => openCaseDetail(c.id)}>👁️</button>
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
            {#if casesTotalPages > 1}
              <div class="pagination">
                <button disabled={casesPage <= 1} on:click={() => { casesPage--; loadCasesList(); }}>{t('prev')}</button>
                <span>{t('page_of').replace('{page}', casesPage).replace('{total}', casesTotalPages)}</span>
                <button disabled={casesPage >= casesTotalPages} on:click={() => { casesPage++; loadCasesList(); }}>{t('next')}</button>
              </div>
            {/if}
          {/if}
        {/if}
      {/if}

    <!-- ======== SETTINGS / CMS ======== -->
    {:else if activeTab === 'settings'}
      {#if loading}
        <div class="empty">{t('loading')}</div>
      {:else}
        <!-- Sub-tabs -->
        <div class="cms-tabs">
          <button class="cms-tab" class:active={settingsTab === 'settings'} on:click={() => switchSettingsTab('settings')}>⚙️ {t('site_settings')}</button>
          <button class="cms-tab" class:active={settingsTab === 'content'} on:click={() => switchSettingsTab('content')}>📝 {t('content_editor')}</button>
          <button class="cms-tab" class:active={settingsTab === 'partners'} on:click={() => switchSettingsTab('partners')}>📍 {t('partners')}</button>
          {#if currentUser?.role === 'super_admin' || !currentUser}
            <button class="cms-tab" class:active={settingsTab === 'users'} on:click={() => switchSettingsTab('users')}>👥 Usuarios</button>
          {/if}
        </div>

        <!-- SETTINGS TAB -->
        {#if settingsTab === 'settings'}
          <section class="settings">
            <h3>{t('site_settings')}</h3>
            <div class="settings__grid">
              {#each Object.entries(siteSettings) as [key, val]}
                <label class="settings__field">
                  <span>{key.replace(/_/g, ' ')}</span>
                  <input type="text" bind:value={siteSettings[key]} />
                </label>
              {/each}
            </div>
            <div class="settings__actions">
              <button class="save-btn" on:click={saveSettings} disabled={settingsSaving}>
                {settingsSaving ? '...' : settingsSaved ? '✓ ' + t('saved') : t('save')}
              </button>
            </div>
          </section>

        <!-- CONTENT EDITOR TAB -->
        {:else if settingsTab === 'content'}
          <section class="settings">
            <div class="cms-header">
              <div>
                <h3>{t('content_editor')}</h3>
                <p class="muted">{t('content_desc')}</p>
              </div>
              <button class="save-btn" on:click={() => showAddContent = !showAddContent}>
                {showAddContent ? t('cancel') : '+ ' + t('add_content')}
              </button>
            </div>

            <!-- Add new content block form -->
            {#if showAddContent}
              <div class="content-add">
                <div class="content-add__grid">
                  <label class="settings__field">
                    <span>{t('content_page')}</span>
                    <select bind:value={newContent.page}>
                      <option value="home">Home</option>
                      <option value="servicios">Servicios</option>
                      <option value="calculadora">Calculadora</option>
                      <option value="requisitos">Requisitos</option>
                      <option value="solicitud">Solicitud</option>
                      <option value="contacto">Contacto</option>
                    </select>
                  </label>
                  <label class="settings__field">
                    <span>{t('content_section')}</span>
                    <input type="text" placeholder="hero, intro, cta..." bind:value={newContent.section} />
                  </label>
                  <label class="settings__field">
                    <span>{t('content_key')}</span>
                    <input type="text" placeholder="title, subtitle, description..." bind:value={newContent.fieldKey} />
                  </label>
                  <label class="settings__field settings__field--full">
                    <span>{t('content_es')}</span>
                    <textarea rows="2" bind:value={newContent.valueEs}></textarea>
                  </label>
                  <label class="settings__field settings__field--full">
                    <span>{t('content_en')}</span>
                    <textarea rows="2" bind:value={newContent.valueEn}></textarea>
                  </label>
                </div>
                <button class="save-btn" on:click={addContentBlock} style="margin-top:12px">
                  {t('save')}
                </button>
              </div>
            {/if}

            <!-- Content blocks list -->
            {#if contentBlocks.length === 0}
              <div class="empty" style="padding:40px 0">{t('no_records')}</div>
            {:else}
              {@const grouped = contentBlocks.reduce((acc, b) => { (acc[b.page] = acc[b.page] || []).push(b); return acc; }, {})}
              {#each Object.entries(grouped) as [page, blocks]}
                <div class="content-group">
                  <h4 class="content-group__title">{page}</h4>
                  {#each blocks as block}
                    <div class="content-block">
                      <div class="content-block__header">
                        <span class="content-block__key">{block.section} → {block.fieldKey}</span>
                      </div>
                      <div class="content-block__fields">
                        <label class="settings__field">
                          <span>🇪🇸 {t('content_es')}</span>
                          <textarea rows="2" bind:value={block.valueEs}></textarea>
                        </label>
                        <label class="settings__field">
                          <span>🇺🇸 {t('content_en')}</span>
                          <textarea rows="2" bind:value={block.valueEn}></textarea>
                        </label>
                      </div>
                      <button class="content-block__save" on:click={() => saveContentBlock(block)} disabled={contentSaving}>
                        {contentSaved ? '✓' : t('save')}
                      </button>
                    </div>
                  {/each}
                </div>
              {/each}
            {/if}
          </section>

        <!-- PARTNERS TAB -->
        {:else if settingsTab === 'partners'}
          <section class="settings">
            <div class="cms-header">
              <div>
                <h3>{t('partners')}</h3>
                <p class="muted">{t('partners_desc')}</p>
              </div>
              {#if !editingPartner}
                <button class="save-btn" on:click={startNewPartner}>+ {t('add_partner')}</button>
              {/if}
            </div>

            <!-- Partner edit form -->
            {#if editingPartner}
              <div class="partner-form">
                <h4>{editingPartner.id ? t('edit_partner') : t('add_partner')}</h4>
                <div class="partner-form__grid">
                  <label class="settings__field">
                    <span>{t('partner_name')} *</span>
                    <input type="text" bind:value={editingPartner.name} required />
                  </label>
                  <label class="settings__field">
                    <span>{t('partner_category')}</span>
                    <select bind:value={editingPartner.category}>
                      <option value="dealer">Dealer</option>
                      <option value="partner">Partner</option>
                      <option value="office">Oficina</option>
                    </select>
                  </label>
                  <label class="settings__field">
                    <span>{t('partner_address')}</span>
                    <input type="text" bind:value={editingPartner.address} />
                  </label>
                  <label class="settings__field">
                    <span>{t('partner_province')}</span>
                    <select bind:value={editingPartner.province}>
                      <option value="">—</option>
                      <option value="San José">San José</option>
                      <option value="Alajuela">Alajuela</option>
                      <option value="Cartago">Cartago</option>
                      <option value="Heredia">Heredia</option>
                      <option value="Guanacaste">Guanacaste</option>
                      <option value="Puntarenas">Puntarenas</option>
                      <option value="Limón">Limón</option>
                    </select>
                  </label>
                  <label class="settings__field">
                    <span>{t('partner_lat')}</span>
                    <input type="number" step="any" bind:value={editingPartner.latitude} placeholder="9.9281" />
                  </label>
                  <label class="settings__field">
                    <span>{t('partner_lng')}</span>
                    <input type="number" step="any" bind:value={editingPartner.longitude} placeholder="-84.0907" />
                  </label>
                  <label class="settings__field">
                    <span>{t('partner_phone')}</span>
                    <input type="tel" bind:value={editingPartner.phone} />
                  </label>
                  <label class="settings__field">
                    <span>{t('partner_website')}</span>
                    <input type="url" bind:value={editingPartner.website} placeholder="https://" />
                  </label>
                  <label class="settings__field">
                    <span>{t('partner_order')}</span>
                    <input type="number" bind:value={editingPartner.sortOrder} />
                  </label>
                  <label class="settings__field settings__field--check">
                    <input type="checkbox" bind:checked={editingPartner.isActive} />
                    <span>{t('partner_active')}</span>
                  </label>
                </div>
                <div class="partner-form__actions">
                  <button class="save-btn" on:click={() => savePartner(editingPartner)} disabled={partnerSaving || !editingPartner.name}>
                    {partnerSaving ? '...' : partnerSaved ? '✓ ' + t('saved') : t('save')}
                  </button>
                  <button class="cancel-btn" on:click={cancelEditPartner}>{t('cancel')}</button>
                </div>
              </div>
            {:else}
              <!-- Partners list -->
              {#if partners.length === 0}
                <div class="empty" style="padding:40px 0">{t('no_records')}</div>
              {:else}
                <div class="table-wrap">
                  <table class="table">
                    <thead>
                      <tr>
                        <th>{t('partner_name')}</th>
                        <th>{t('partner_category')}</th>
                        <th>{t('partner_province')}</th>
                        <th>{t('partner_phone')}</th>
                        <th>{t('partner_active')}</th>
                        <th>{t('actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {#each partners as p}
                        <tr>
                          <td class="cell--name">{p.name}</td>
                          <td><span class="cat-badge">{p.category || '—'}</span></td>
                          <td>{p.province || '—'}</td>
                          <td>{p.phone || '—'}</td>
                          <td>
                            {#if p.isActive}
                              <span class="active-dot active-dot--on"></span>
                            {:else}
                              <span class="active-dot active-dot--off"></span>
                            {/if}
                          </td>
                          <td class="cell--actions">
                            <button class="mini-btn" on:click={() => startEditPartner(p)}>✏️</button>
                            <button class="mini-btn" on:click={() => deletePartner(p.id)}>🗑️</button>
                          </td>
                        </tr>
                      {/each}
                    </tbody>
                  </table>
                </div>
              {/if}
            {/if}
          </section>
        {:else if settingsTab === 'users'}
          <section class="settings-section">
            <h3>👥 Gestión de usuarios</h3>
            <div class="user-create-form">
              <h4>Crear nuevo usuario</h4>
              <div class="user-form-grid">
                <input type="text" placeholder="Nombre completo" bind:value={newUserForm.name} class="user-input" />
                <input type="email" placeholder="Email" bind:value={newUserForm.email} class="user-input" />
                <input type="password" placeholder="Contraseña (mín. 8 caracteres)" bind:value={newUserForm.password} class="user-input" />
                <select bind:value={newUserForm.role} class="user-input">
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                  <option value="viewer">Solo lectura</option>
                </select>
              </div>
              {#if userMessage}<p class="user-msg">{userMessage}</p>{/if}
              <button class="save-btn" on:click={createUser}>Crear usuario</button>
            </div>
            <div class="users-list" style="margin-top:24px;">
              <h4>Usuarios registrados ({adminUsers.length})</h4>
              {#if adminUsers.length === 0}
                <p class="empty" style="padding:20px 0">No hay usuarios registrados.</p>
              {:else}
                <div class="table-wrap">
                  <table class="table">
                    <thead><tr><th>Nombre</th><th>Email</th><th>Rol</th><th>Estado</th><th>Último acceso</th><th>Acciones</th></tr></thead>
                    <tbody>
                      {#each adminUsers as u}
                        <tr class:row--inactive={!u.isActive}>
                          <td class="cell--name">{u.name}</td>
                          <td>{u.email}</td>
                          <td><select value={u.role} on:change={e => changeUserRole(u.id, e.target.value)} class="role-sel"><option value="super_admin">Super Admin</option><option value="admin">Admin</option><option value="viewer">Solo lectura</option></select></td>
                          <td>{#if u.isActive}<span class="active-dot active-dot--on"></span> Activo{:else}<span class="active-dot active-dot--off"></span> Inactivo{/if}</td>
                          <td>{u.lastLogin ? fmtDate(u.lastLogin) : 'Nunca'}</td>
                          <td><button class="action-btn" on:click={() => toggleUserActive(u.id, u.isActive)}>{u.isActive ? '🚫' : '✅'}</button> <button class="action-btn" on:click={() => { resetPwUserId = u.id; resetPwValue = ''; resetPwMsg = ''; }}>🔑</button> <button class="action-btn action-btn--del" on:click={() => deleteUser(u.id, u.name)}>🗑️</button></td>
                        </tr>
                        {#if resetPwUserId === u.id}
                          <tr>
                            <td colspan="6" style="background:rgba(213,181,132,.05); padding:12px;">
                              <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
                                <span style="font-size:.82rem; color:#d5b584; font-weight:600;">Nueva contraseña para {u.name}:</span>
                                <input type="password" placeholder="Mín. 8 caracteres" bind:value={resetPwValue} class="user-input" style="flex:1; min-width:180px;" />
                                <button class="save-btn" on:click={resetUserPassword}>Guardar</button>
                                <button class="cancel-btn" on:click={() => { resetPwUserId = null; }}>Cancelar</button>
                                {#if resetPwMsg}<span style="font-size:.8rem; color:#d5b584;">{resetPwMsg}</span>{/if}
                              </div>
                            </td>
                          </tr>
                        {/if}
                      {/each}
                    </tbody>
                  </table>
                </div>
              {/if}
            </div>
          </section>
        {/if}
      {/if}
    {/if}

  </main>
  {/if}
</div>

<style>
  :global(*) { box-sizing: border-box; }
  :global(body) { margin:0; font-family:'Montserrat',-apple-system,system-ui,sans-serif; background:#0a1929; color:#e8e4dc; -webkit-font-smoothing:antialiased; }

  .admin { min-height:100vh; }

  /* ---- LOGIN ---- */
  .login { display:flex; align-items:center; justify-content:center; min-height:100vh; padding:20px; background:radial-gradient(ellipse at 50% 30%, #122941 0%, #0a1929 70%); }
  .login__card { background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.08); border-radius:24px; padding:56px 44px; width:100%; max-width:400px; text-align:center; backdrop-filter:blur(8px); }
  .login__brand { color:#d5b584; display:flex; align-items:center; justify-content:center; }
  :global(.login__logo-svg) { width:200px; height:auto; }
  .login__card h1 { font-size:.95rem; font-weight:400; color:rgba(255,246,226,.45); margin:4px 0 36px; letter-spacing:.04em; }
  .login__input { width:100%; padding:16px 20px; border:1px solid rgba(255,255,255,.12); border-radius:14px; background:rgba(255,255,255,.05); color:#fff; font-size:1rem; outline:none; transition:border .2s; }
  .login__input:focus { border-color:#d5b584; }
  .login__btn { width:100%; padding:16px; border:none; border-radius:14px; background:linear-gradient(135deg, #d5b584, #c9a36e); color:#0a1929; font-weight:700; font-size:1rem; cursor:pointer; margin-top:16px; transition:transform .15s; }
  .login__btn:active { transform:scale(.98); }
  .login__error { color:#ef4444; font-size:.85rem; margin:8px 0 0; }
  .login__success { color:#22c55e; font-size:.85rem; margin:8px 0 0; }
  .login__link { background:none; border:none; color:rgba(255,246,226,.4); font-size:.82rem; cursor:pointer; margin-top:12px; transition:color .2s; padding:0; }
  .login__link:hover { color:#d5b584; }
  .login__subtitle { font-size:.85rem; color:rgba(255,246,226,.45); margin:0 0 16px; line-height:1.5; }
  .login__lang { background:none; border:none; color:rgba(255,246,226,.35); cursor:pointer; margin-top:20px; font-size:.8rem; }

  /* User management */
  .user-create-form { background:rgba(255,255,255,.03); border-radius:12px; padding:20px; border:1px solid rgba(255,255,255,.06); }
  .user-create-form h4 { margin:0 0 12px; font-size:.9rem; color:#d5b584; }
  .user-form-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:12px; }
  .user-input { padding:10px 14px; border:1px solid rgba(255,255,255,.1); border-radius:8px; background:rgba(255,255,255,.05); color:#fff; font-size:.88rem; outline:none; }
  .user-input:focus { border-color:rgba(213,181,132,.4); }
  .user-msg { font-size:.82rem; color:#d5b584; margin:8px 0 0; }
  .role-sel { background:rgba(255,255,255,.05); color:#e8e4dc; border:1px solid rgba(255,255,255,.1); border-radius:6px; padding:4px 8px; font-size:.78rem; }
  .row--inactive { opacity:.4; }
  .action-btn--del { color:#ef4444; }
  .action-btn--del:hover { background:rgba(239,68,68,.1); }
  .cancel-btn { padding:8px 16px; border:1px solid rgba(255,255,255,.12); border-radius:8px; background:none; color:rgba(255,246,226,.5); font-size:.82rem; cursor:pointer; font-family:inherit; }
  .cancel-btn:hover { border-color:rgba(255,255,255,.25); color:#fff; }

  /* Case from detail */
  .case-create-inline { background:rgba(213,181,132,.05); border:1px solid rgba(213,181,132,.15); border-radius:12px; padding:16px; }
  .case-create-inline h4 { color:#d5b584; }
  .case-create-fields { display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; margin-top:12px; }
  .case-create-fields label { display:flex; flex-direction:column; gap:4px; }
  .case-create-fields .lbl { font-size:.7rem; text-transform:uppercase; color:rgba(255,255,255,.4); }
  .case-create-fields .full-width { grid-column:1 / -1; }
  .action-btn--case { background:rgba(213,181,132,.1); border-color:rgba(213,181,132,.3); color:#d5b584; }
  .action-btn--case:hover { background:rgba(213,181,132,.2); }
  @media (max-width:600px) { .case-create-fields { grid-template-columns:1fr; } }
  .login__lang:hover { color:rgba(255,246,226,.6); }

  /* ---- HEADER ---- */
  .header { display:flex; align-items:center; justify-content:space-between; padding:14px 24px; background:rgba(0,0,0,.25); border-bottom:1px solid rgba(255,255,255,.06); position:sticky; top:0; z-index:100; backdrop-filter:blur(12px); }
  .header__left { display:flex; align-items:center; gap:14px; }
  .header__brand { display:flex; align-items:center; color:#d5b584; }
  :global(.header__logo-svg) { width:130px; height:auto; }
  .header__badge { font-size:.65rem; font-weight:700; text-transform:uppercase; letter-spacing:.12em; padding:4px 10px; background:rgba(213,181,132,.12); border:1px solid rgba(213,181,132,.2); border-radius:6px; color:#d5b584; }
  .header__right { display:flex; align-items:center; gap:10px; }
  .header__lang { background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.1); border-radius:8px; color:rgba(255,246,226,.6); padding:6px 14px; cursor:pointer; font-size:.8rem; font-weight:600; }
  .header__user { font-size:.78rem; color:rgba(255,246,226,.4); margin-right:8px; }
  .header__logout { background:none; border:1px solid rgba(255,255,255,.12); border-radius:8px; color:rgba(255,246,226,.5); padding:6px 16px; cursor:pointer; font-size:.8rem; }
  .header__logout:hover { border-color:rgba(255,255,255,.25); color:#fff; }

  /* ---- NAV ---- */
  .nav { display:flex; gap:6px; padding:16px 24px 0; flex-wrap:wrap; }
  .nav__tab { display:flex; align-items:center; gap:8px; padding:10px 18px; border:1px solid rgba(255,255,255,.06); border-radius:12px 12px 0 0; background:rgba(255,255,255,.02); color:rgba(255,246,226,.5); cursor:pointer; font-size:.85rem; font-weight:500; border-bottom:2px solid transparent; transition:all .2s; }
  .nav__tab.active { background:rgba(213,181,132,.08); border-color:rgba(213,181,132,.2); border-bottom-color:#d5b584; color:#d5b584; }
  .nav__tab:hover:not(.active) { background:rgba(255,255,255,.04); }
  .nav__icon { font-size:1rem; }
  .nav__label { display:inline; }
  .nav__count { background:rgba(213,181,132,.15); padding:2px 8px; border-radius:6px; font-size:.72rem; font-weight:700; }

  /* ---- MAIN ---- */
  .main { padding:20px 24px 40px; max-width:1320px; margin:0 auto; }
  .empty { text-align:center; padding:80px 0; color:rgba(255,246,226,.3); font-size:1.05rem; }
  .muted { color:rgba(255,246,226,.35); font-size:.85rem; margin:0; }

  /* ---- KPI CARDS ---- */
  .kpi-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(160px, 1fr)); gap:14px; margin-bottom:24px; }
  .kpi { padding:22px 20px; border-radius:16px; background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.06); }
  .kpi__value { font-size:1.8rem; font-weight:800; line-height:1; margin-bottom:6px; }
  .kpi__label { font-size:.78rem; color:rgba(255,246,226,.45); font-weight:500; text-transform:uppercase; letter-spacing:.04em; }
  .kpi--gold .kpi__value { color:#d5b584; }
  .kpi--blue .kpi__value { color:#5b8fd9; }
  .kpi--teal .kpi__value { color:#14b8a6; }
  .kpi--purple .kpi__value { color:#8b5cf6; }
  .kpi--green .kpi__value { color:#22c55e; }
  .kpi--gray .kpi__value { color:#94a3b8; }

  /* ---- DASHBOARD GRID ---- */
  .dash-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:16px; }
  .dash-card { background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.06); border-radius:16px; padding:22px; }
  .dash-card h3 { font-size:.9rem; font-weight:700; margin:0 0 16px; color:rgba(255,246,226,.7); }
  .dash-card--alert { border-color:rgba(245,158,11,.2); }
  .dash-card--wide { grid-column:1 / -1; }

  /* Funnel */
  .funnel__row { display:flex; align-items:center; gap:10px; margin-bottom:8px; font-size:.82rem; }
  .funnel__dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
  .funnel__label { width:100px; flex-shrink:0; text-transform:capitalize; }
  .funnel__bar-wrap { flex:1; height:8px; background:rgba(255,255,255,.04); border-radius:4px; overflow:hidden; }
  .funnel__bar { height:100%; border-radius:4px; transition:width .4s; }
  .funnel__count { width:30px; text-align:right; font-weight:700; font-size:.78rem; }

  /* Sparkline */
  .spark { display:flex; align-items:flex-end; gap:3px; height:100px; padding-top:8px; }
  .spark__bar-wrap { flex:1; height:100%; display:flex; align-items:flex-end; }
  .spark__bar { width:100%; background:linear-gradient(to top, #14b8a6, rgba(20,184,166,.3)); border-radius:3px 3px 0 0; min-height:4px; transition:height .3s; }

  /* Province list */
  .province-row { display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid rgba(255,255,255,.04); font-size:.85rem; }
  .province-count { font-weight:700; color:#d5b584; }

  /* Attention */
  .attn-row { display:flex; justify-content:space-between; align-items:center; padding:8px 12px; margin-bottom:6px; border-radius:10px; background:rgba(245,158,11,.06); border:1px solid rgba(245,158,11,.12); cursor:pointer; transition:background .2s; }
  .attn-row:hover { background:rgba(245,158,11,.12); }
  .attn-name { font-weight:600; font-size:.85rem; }
  .attn-amount { font-size:.82rem; color:#d5b584; }
  .attn-date { font-size:.75rem; color:rgba(255,246,226,.4); }

  /* Activity feed */
  .activity-feed { max-height:320px; overflow-y:auto; }
  .activity-item { display:flex; align-items:flex-start; gap:10px; padding:8px 0; border-bottom:1px solid rgba(255,255,255,.03); font-size:.82rem; }
  .activity-dot { width:8px; height:8px; border-radius:50%; margin-top:5px; flex-shrink:0; }
  .activity-text { flex:1; line-height:1.4; }
  .activity-meta { display:block; font-size:.72rem; color:rgba(255,246,226,.3); margin-top:2px; }

  /* ---- TOOLBAR ---- */
  .toolbar { display:flex; flex-wrap:wrap; gap:12px; margin-bottom:16px; align-items:center; }
  .toolbar__search { flex:1; min-width:240px; padding:12px 16px; border-radius:12px; border:1px solid rgba(255,255,255,.1); background:rgba(255,255,255,.04); color:#fff; font-size:.9rem; outline:none; }
  .toolbar__search:focus { border-color:#d5b584; }
  .toolbar__search::placeholder { color:rgba(255,246,226,.3); }
  .toolbar__filters { display:flex; gap:8px; flex-wrap:wrap; align-items:center; }
  .toolbar__select, .toolbar__date { padding:10px 12px; border-radius:10px; border:1px solid rgba(255,255,255,.1); background:rgba(255,255,255,.04); color:#e8e4dc; font-size:.82rem; outline:none; }
  .toolbar__select option, .toolbar__date { background:#122941; }
  .toolbar__export { padding:10px 18px; border-radius:10px; border:1px solid rgba(213,181,132,.3); background:transparent; color:#d5b584; cursor:pointer; font-size:.82rem; font-weight:600; white-space:nowrap; }
  .toolbar__export:hover { background:rgba(213,181,132,.08); }

  /* ---- TABLE ---- */
  .table-wrap { overflow-x:auto; border-radius:14px; border:1px solid rgba(255,255,255,.06); }
  .table { width:100%; border-collapse:collapse; font-size:.82rem; }
  .table th { text-align:left; padding:14px 14px; background:rgba(0,0,0,.2); color:rgba(255,246,226,.45); font-weight:600; text-transform:uppercase; font-size:.7rem; letter-spacing:.06em; white-space:nowrap; user-select:none; }
  .table th.sortable { cursor:pointer; }
  .table th.sortable:hover { color:#d5b584; }
  .table td { padding:12px 14px; border-top:1px solid rgba(255,255,255,.04); vertical-align:middle; }
  .row--click { cursor:pointer; transition:background .15s; }
  .row--click:hover td { background:rgba(213,181,132,.03); }
  .cell--name { font-weight:600; color:#fff; white-space:nowrap; }
  .cell--msg { max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .cell--actions { white-space:nowrap; }
  .inline-sel { background:transparent; border:1px solid rgba(255,255,255,.1); border-radius:6px; padding:4px 8px; font-size:.78rem; font-weight:600; cursor:pointer; }
  .inline-sel option { background:#122941; color:#e8e4dc; }
  .priority-badge { font-size:.75rem; font-weight:700; text-transform:uppercase; letter-spacing:.04em; }
  .mini-btn { background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08); border-radius:8px; padding:4px 8px; cursor:pointer; font-size:.9rem; margin-left:4px; }
  .mini-btn:hover { background:rgba(255,255,255,.1); }

  /* ---- PAGINATION ---- */
  .pagination { display:flex; align-items:center; justify-content:center; gap:16px; padding:20px 0; }
  .pagination button { padding:8px 18px; border-radius:10px; border:1px solid rgba(255,255,255,.1); background:transparent; color:rgba(255,246,226,.6); cursor:pointer; font-size:.85rem; }
  .pagination button:disabled { opacity:.25; cursor:default; }
  .pagination span { font-size:.82rem; color:rgba(255,246,226,.35); }

  /* ---- DETAIL VIEW ---- */
  .back-btn { background:none; border:none; color:#d5b584; cursor:pointer; font-size:.9rem; font-weight:600; padding:0; margin-bottom:16px; }
  .back-btn:hover { text-decoration:underline; }
  .detail { background:rgba(255,255,255,.02); border:1px solid rgba(255,255,255,.06); border-radius:18px; padding:28px; }
  .detail__header { display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:16px; margin-bottom:20px; }
  .detail__header h2 { font-size:1.3rem; font-weight:700; margin:0; }
  .detail__sub { font-size:.82rem; color:rgba(255,246,226,.4); margin:4px 0 0; }
  .detail__actions { display:flex; gap:8px; flex-wrap:wrap; }
  .action-btn { padding:8px 16px; border-radius:10px; border:1px solid rgba(255,255,255,.12); background:rgba(255,255,255,.04); color:#e8e4dc; cursor:pointer; font-size:.82rem; font-weight:600; transition:all .2s; }
  .action-btn--wa:hover { background:rgba(37,211,102,.12); border-color:rgba(37,211,102,.3); color:#25d366; }
  .action-btn--call:hover { background:rgba(91,143,217,.1); border-color:rgba(91,143,217,.3); color:#5b8fd9; }
  .action-btn--email:hover { background:rgba(213,181,132,.1); border-color:rgba(213,181,132,.3); color:#d5b584; }

  .detail__controls { display:flex; gap:16px; margin-bottom:24px; flex-wrap:wrap; }
  .detail__label { display:block; font-size:.72rem; text-transform:uppercase; letter-spacing:.06em; color:rgba(255,246,226,.4); margin-bottom:4px; }
  .status-sel, .priority-sel { padding:8px 14px; border-radius:10px; border:1px solid rgba(255,255,255,.12); background:rgba(255,255,255,.04); color:#e8e4dc; font-size:.85rem; font-weight:600; cursor:pointer; }
  .status-sel option, .priority-sel option { background:#122941; }

  .detail__sections { display:flex; flex-direction:column; gap:20px; margin-bottom:28px; }
  .detail__section { border-top:1px solid rgba(255,255,255,.05); padding-top:20px; }
  .detail__section h4 { font-size:.82rem; text-transform:uppercase; letter-spacing:.06em; color:rgba(255,246,226,.5); margin:0 0 14px; }
  .detail__grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(220px, 1fr)); gap:12px; font-size:.85rem; }
  .detail__grid--full { grid-column:1 / -1; }

  .cedula-images { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
  .cedula-img-box { background:rgba(18,41,65,0.03); border-radius:10px; padding:8px; text-align:center; }
  .cedula-img-label { display:block; font-size:0.7rem; text-transform:uppercase; letter-spacing:0.04em; color:rgba(255,255,255,0.4); margin-bottom:6px; }
  .cedula-img { width:100%; max-height:280px; object-fit:contain; border-radius:8px; border:1px solid rgba(255,255,255,0.06); }
  @media (max-width:600px) { .cedula-images { grid-template-columns:1fr; } }
  .lbl { display:block; font-size:.72rem; text-transform:uppercase; letter-spacing:.05em; color:rgba(255,246,226,.35); margin-bottom:2px; }

  /* Notes */
  .note-form { display:flex; gap:10px; margin-bottom:16px; }
  .note-form textarea { flex:1; padding:12px 14px; border-radius:12px; border:1px solid rgba(255,255,255,.1); background:rgba(255,255,255,.04); color:#fff; font-size:.85rem; resize:vertical; outline:none; font-family:inherit; }
  .note-form textarea:focus { border-color:#d5b584; }
  .note-form textarea::placeholder { color:rgba(255,246,226,.3); }
  .note-submit { padding:12px 20px; border-radius:12px; border:none; background:#d5b584; color:#0a1929; font-weight:700; font-size:.85rem; cursor:pointer; white-space:nowrap; align-self:flex-end; }
  .note-submit:disabled { opacity:.4; cursor:default; }
  .notes-list { display:flex; flex-direction:column; gap:10px; }
  .note-item { padding:14px 16px; border-radius:12px; background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.05); }
  .note-meta { font-size:.72rem; color:rgba(255,246,226,.35); margin-bottom:6px; }
  .note-content { font-size:.85rem; line-height:1.5; white-space:pre-wrap; }

  /* Timeline */
  .timeline { display:flex; flex-direction:column; gap:12px; }
  .timeline-item { display:flex; align-items:flex-start; gap:12px; font-size:.82rem; }
  .timeline-dot { width:10px; height:10px; border-radius:50%; margin-top:4px; flex-shrink:0; }
  .timeline-meta { font-size:.72rem; color:rgba(255,246,226,.3); margin-top:2px; }

  /* ---- SETTINGS ---- */
  .settings { background:rgba(255,255,255,.02); border:1px solid rgba(255,255,255,.06); border-radius:18px; padding:28px; }
  .settings h3 { font-size:1rem; font-weight:700; margin:0 0 20px; }
  .settings__grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(300px, 1fr)); gap:14px; margin-bottom:24px; }
  .settings__field { display:flex; flex-direction:column; gap:4px; }
  .settings__field span { font-size:.72rem; text-transform:uppercase; letter-spacing:.05em; color:rgba(255,246,226,.4); }
  .settings__field input { padding:12px 14px; border-radius:10px; border:1px solid rgba(255,255,255,.1); background:rgba(255,255,255,.04); color:#fff; font-size:.85rem; outline:none; }
  .settings__field input:focus { border-color:#d5b584; }
  .settings__actions { display:flex; gap:12px; }
  .save-btn { padding:12px 28px; border-radius:12px; border:none; background:linear-gradient(135deg, #d5b584, #c9a36e); color:#0a1929; font-weight:700; font-size:.9rem; cursor:pointer; }
  .save-btn:disabled { opacity:.5; }

  /* ---- KANBAN ---- */
  .conv-funnel { display:flex; flex-direction:column; gap:8px; }
  .conv-funnel__step { position:relative; }
  .conv-funnel__bar { height:28px; border-radius:6px; opacity:.25; transition:width .4s; }
  .conv-funnel__label { position:absolute; top:4px; left:12px; font-size:.82rem; color:rgba(255,246,226,.8); }
  .conv-funnel__label strong { margin-left:6px; }
  .conv-funnel__pct { font-size:.72rem; color:rgba(255,246,226,.4); margin-left:4px; }

  .monthly-chart { display:flex; gap:8px; align-items:flex-end; height:140px; }
  .monthly-chart__col { flex:1; display:flex; flex-direction:column; align-items:center; gap:2px; height:100%; }
  .monthly-chart__bar-wrap { flex:1; width:100%; display:flex; align-items:flex-end; }
  .monthly-chart__bar { width:100%; background:linear-gradient(to top, #5b8fd9, rgba(91,143,217,.3)); border-radius:4px 4px 0 0; min-height:4px; transition:height .3s; }
  .monthly-chart__count { font-size:.75rem; font-weight:700; color:#5b8fd9; }
  .monthly-chart__label { font-size:.7rem; color:rgba(255,246,226,.4); }
  .monthly-chart__vol { font-size:.65rem; color:rgba(255,246,226,.25); }

  .kanban { display:flex; gap:10px; overflow-x:auto; padding-bottom:8px; }
  .kanban__col { min-width:180px; flex:1; max-width:220px; }
  .kanban__col-header { font-size:.75rem; font-weight:700; text-transform:uppercase; letter-spacing:.06em; color:rgba(255,246,226,.5); padding:8px 10px; margin-bottom:8px; border-bottom:2px solid; }
  .kanban__count { background:rgba(255,255,255,.06); padding:2px 6px; border-radius:6px; font-size:.7rem; margin-left:6px; }
  .kanban__cards { display:flex; flex-direction:column; gap:6px; }
  .kanban__card { padding:12px; border-radius:10px; background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.06); cursor:pointer; transition:background .15s; }
  .kanban__card:hover { background:rgba(213,181,132,.04); border-color:rgba(213,181,132,.15); }
  .kanban__card-name { font-weight:600; font-size:.82rem; color:#fff; margin-bottom:4px; }
  .kanban__card-meta { display:flex; gap:6px; font-size:.72rem; color:rgba(255,246,226,.4); }
  .kanban__source { background:rgba(255,255,255,.06); padding:1px 6px; border-radius:4px; }
  .kanban__card-assigned { font-size:.72rem; color:rgba(255,246,226,.35); margin-top:4px; }
  .kanban__card-followup { font-size:.72rem; color:rgba(255,246,226,.4); margin-top:4px; }
  .kanban__card-followup.overdue { color:#ef4444; font-weight:600; }
  .kanban__card-actions { display:flex; gap:4px; margin-top:6px; }
  .overdue { color:#ef4444 !important; font-weight:600; }

  /* ---- CMS SUB-TABS ---- */
  .cms-tabs { display:flex; gap:6px; margin-bottom:20px; flex-wrap:wrap; }
  .cms-tab { padding:10px 18px; border-radius:10px; border:1px solid rgba(255,255,255,.06); background:rgba(255,255,255,.02); color:rgba(255,246,226,.5); cursor:pointer; font-size:.85rem; font-weight:500; transition:all .2s; }
  .cms-tab.active { background:rgba(213,181,132,.08); border-color:rgba(213,181,132,.25); color:#d5b584; }
  .cms-tab:hover:not(.active) { background:rgba(255,255,255,.04); }

  .cms-header { display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:12px; margin-bottom:20px; }
  .cms-header h3 { margin:0 0 4px; }

  /* ---- CONTENT EDITOR ---- */
  .content-add { background:rgba(213,181,132,.04); border:1px solid rgba(213,181,132,.15); border-radius:14px; padding:20px; margin-bottom:20px; }
  .content-add__grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(200px, 1fr)); gap:12px; }
  .content-add__grid select { padding:12px 14px; border-radius:10px; border:1px solid rgba(255,255,255,.1); background:rgba(255,255,255,.04); color:#e8e4dc; font-size:.85rem; }

  .content-group { margin-bottom:24px; }
  .content-group__title { font-size:.78rem; text-transform:uppercase; letter-spacing:.08em; color:#d5b584; margin:0 0 12px; padding-bottom:8px; border-bottom:1px solid rgba(213,181,132,.15); }

  .content-block { display:flex; flex-wrap:wrap; align-items:flex-start; gap:12px; padding:16px; margin-bottom:10px; border-radius:12px; background:rgba(255,255,255,.02); border:1px solid rgba(255,255,255,.05); }
  .content-block__header { width:100%; }
  .content-block__key { font-size:.78rem; font-weight:600; color:rgba(255,246,226,.6); font-family:monospace; background:rgba(255,255,255,.04); padding:4px 10px; border-radius:6px; }
  .content-block__fields { display:grid; grid-template-columns:1fr 1fr; gap:12px; width:100%; }
  .content-block__save { padding:6px 16px; border-radius:8px; border:1px solid rgba(213,181,132,.3); background:transparent; color:#d5b584; cursor:pointer; font-size:.78rem; font-weight:600; align-self:flex-end; }
  .content-block__save:disabled { opacity:.4; }
  .content-block__save:hover:not(:disabled) { background:rgba(213,181,132,.08); }

  .settings__field textarea { width:100%; padding:10px 14px; border-radius:10px; border:1px solid rgba(255,255,255,.1); background:rgba(255,255,255,.04); color:#fff; font-size:.85rem; font-family:inherit; outline:none; resize:vertical; }
  .settings__field textarea:focus { border-color:#d5b584; }
  .settings__field select { width:100%; padding:12px 14px; border-radius:10px; border:1px solid rgba(255,255,255,.1); background:rgba(255,255,255,.04); color:#e8e4dc; font-size:.85rem; outline:none; }
  .settings__field select option { background:#122941; }
  .settings__field--full { grid-column:1 / -1; }
  .settings__field--check { flex-direction:row; align-items:center; gap:10px; }
  .settings__field--check input[type="checkbox"] { width:20px; height:20px; accent-color:#d5b584; }

  /* ---- PARTNER FORM ---- */
  .partner-form { background:rgba(255,255,255,.02); border:1px solid rgba(255,255,255,.06); border-radius:14px; padding:24px; }
  .partner-form h4 { font-size:1rem; margin:0 0 16px; }
  .partner-form__grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(200px, 1fr)); gap:14px; margin-bottom:20px; }
  .partner-form__actions { display:flex; gap:10px; }
  .cancel-btn { padding:12px 24px; border-radius:12px; border:1px solid rgba(255,255,255,.12); background:transparent; color:rgba(255,246,226,.6); cursor:pointer; font-size:.85rem; }
  .cancel-btn:hover { border-color:rgba(255,255,255,.25); }

  .cat-badge { font-size:.72rem; font-weight:600; text-transform:uppercase; letter-spacing:.04em; padding:4px 10px; border-radius:6px; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08); }
  .active-dot { display:inline-block; width:10px; height:10px; border-radius:50%; }
  .active-dot--on { background:#22c55e; }
  .active-dot--off { background:#6b7280; }

  /* ---- RESPONSIVE ---- */
  @media (max-width:768px) {
    .main { padding:16px; }
    .nav { padding:12px 16px 0; }
    .nav__label { display:none; }
    .nav__tab { padding:10px 14px; }
    .kpi-grid { grid-template-columns:repeat(2, 1fr); }
    .dash-grid { grid-template-columns:1fr; }
    .detail__header { flex-direction:column; }
    .detail__grid { grid-template-columns:1fr; }
    .toolbar { flex-direction:column; }
    .toolbar__search { min-width:100%; }
    .table th, .table td { padding:10px 8px; }
    .note-form { flex-direction:column; }
    .content-block__fields { grid-template-columns:1fr; }
    .partner-form__grid { grid-template-columns:1fr; }
    .content-add__grid { grid-template-columns:1fr; }
    .cms-header { flex-direction:column; }
  }
</style>
