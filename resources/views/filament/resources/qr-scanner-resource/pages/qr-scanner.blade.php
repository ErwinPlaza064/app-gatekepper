<x-filament-panels::page>
<div class="space-y-6">
<x-filament::section>
<x-slot name="heading">
<div class="flex items-center gap-x-3">
<x-heroicon-o-qr-code class="w-6 h-6 text-gray-500 dark:text-gray-400" />
Escáner de Códigos QR
</div>
</x-slot>
<x-slot name="description">
Utiliza la cámara para escanear códigos QR o sube una imagen desde tu dispositivo.
</x-slot>
<div id="qr-scanner-container">
<div id="camera-support-warning" class="p-4 mb-4 text-sm text-yellow-800 bg-yellow-100 border border-yellow-300 rounded">
<strong>¿Problemas para iniciar la cámara?</strong><br>
Si ves un error, verifica que tu navegador tenga permisos y soporte para cámara.<br>
Usa Chrome, Firefox o Safari y accede por HTTPS para mejor compatibilidad.<br>
Si no funciona, puedes subir una imagen QR.
</div>
<div id="scanner-initial-state" class="text-center">
<div class="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full dark:bg-gray-800">
<x-heroicon-o-camera class="w-8 h-8 text-gray-400 dark:text-gray-500" />
</div>
<div class="space-y-3">
<x-filament::button id="start-camera-btn" color="primary" icon="heroicon-o-camera" size="lg">
Iniciar Cámara
</x-filament::button>
<div class="text-sm text-gray-500 dark:text-gray-400">o</div>
<div>
<label for="qr-file-input" class="cursor-pointer">
<x-filament::button color="gray" icon="heroicon-o-photo" size="lg" tag="span">
Subir Imagen QR
</x-filament::button>
</label>
<input type="file" id="qr-file-input" accept="image/*" class="hidden">
</div>
</div>
</div>
<div id="reader-container" class="hidden">
<div class="max-w-md mx-auto">
  <div id="reader" style="width: 100%; height: 350px; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; background: #f9fafb;"></div>
</div>
<div class="flex flex-col items-center gap-2 mt-4">
  <div class="flex gap-2">
    <x-filament::button id="switch-camera-btn" color="secondary" icon="heroicon-o-arrow-path" size="lg">
      Voltear Cámara
    </x-filament::button>
    <x-filament::button id="stop-camera-btn" color="danger" icon="heroicon-o-stop" size="lg">
      Detener Cámara
    </x-filament::button>
  </div>
</div>
</div>
</div>
<div id="message-area" class="hidden mt-4">
<div id="success-message" class="hidden p-3 border border-green-200 rounded-lg bg-green-50 dark:bg-green-900/20 dark:border-green-800">
<div class="flex items-center">
<x-heroicon-o-check-circle class="w-5 h-5 mr-3 text-green-600 dark:text-green-400" />
<div>
<h4 class="text-sm font-medium text-green-800 dark:text-green-200">¡Éxito!</h4>
<p id="success-text" class="text-sm text-green-700 dark:text-green-300"></p>
</div>
</div>
</div>
<div id="error-message" class="hidden p-3 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20 dark:border-red-800">
<div class="flex items-center">
<x-heroicon-o-exclamation-triangle class="w-5 h-5 mr-3 text-red-600 dark:text-red-400" />
<div>
<h4 class="text-sm font-medium text-red-800 dark:text-red-200">Error</h4>
<p id="error-text" class="text-sm text-red-700 dark:text-red-300"></p>
</div>
</div>
</div>
<div id="loading-message" class="hidden p-3 border border-blue-200 rounded-lg bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
<div class="flex items-center">
<x-filament::loading-indicator class="w-4 h-4 mr-3" />
<div>
<h4 class="text-sm font-medium text-blue-800 dark:text-blue-200">Procesando...</h4>
<p id="loading-text" class="text-sm text-blue-700 dark:text-blue-300">Procesando código QR...</p>
</div>
</div>
</div>
</div>
</x-filament::section>
<x-filament::section>
<x-slot name="heading">
<div class="flex items-center gap-x-3">
<x-heroicon-o-table-cells class="w-6 h-6 text-gray-500 dark:text-gray-400" />
Escaneos Recientes
</div>
</x-slot>
<div class="overflow-hidden">
<div class="overflow-x-auto">
<table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700" id="recent-scans-table">
<thead class="bg-gray-50 dark:bg-gray-800">
<tr>
<th class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">Visitante</th>
<th class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">Documento</th>
<th class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">Residente</th>
<th class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">Hora de Entrada</th>
<th class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">Placa</th>
</tr>
</thead>
<tbody class="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700" id="recent-scans-body">
<tr>
<td colspan="5" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
<x-filament::loading-indicator class="w-5 h-5 mx-auto mb-2" />
Cargando datos...
</td>
</tr>
</tbody>
</table>
</div>
</div>
</x-filament::section>
</div>
@push('scripts')
<script type="module">
import QrScanner from 'https://cdn.jsdelivr.net/npm/qr-scanner@1.4.2/qr-scanner.min.js';

class QRScannerManager {
  constructor() {
    this.qrScanner = null;
    this.isScanning = false;
    this.lastScannedText = null;
    this.lastScanTime = 0;
    this.cameras = [];
    this.currentCameraIndex = 0;
    this.initializeElements();
    this.setupEventListeners();
    this.loadRecentScans();
  }
  initializeElements() {
    this.startBtn = document.getElementById('start-camera-btn');
    this.stopBtn = document.getElementById('stop-camera-btn');
    this.switchCameraBtn = document.getElementById('switch-camera-btn');
    this.fileInput = document.getElementById('qr-file-input');
    this.initialState = document.getElementById('scanner-initial-state');
    this.readerContainer = document.getElementById('reader-container');
    this.readerDiv = document.getElementById('reader');
    this.messageArea = document.getElementById('message-area');
    this.successMessage = document.getElementById('success-message');
    this.errorMessage = document.getElementById('error-message');
    this.loadingMessage = document.getElementById('loading-message');
    this.successText = document.getElementById('success-text');
    this.errorText = document.getElementById('error-text');
    this.recentScansBody = document.getElementById('recent-scans-body');
  }
  setupEventListeners() {
    this.startBtn.addEventListener('click', () => this.startCamera());
    this.stopBtn.addEventListener('click', () => this.stopCamera());
    // Compatibilidad móvil: verificar soporte antes de usar input file
    this.fileInput.addEventListener('click', (e) => {
      if (!window.FileReader || !window.URL || !window.Blob) {
        e.preventDefault();
        this.showError('Tu navegador no soporta la selección de archivos. Usa un navegador actualizado.');
      }
    });
    this.fileInput.addEventListener('change', (e) => this.scanFromFile(e));
    if (this.switchCameraBtn) {
      this.switchCameraBtn.addEventListener('click', () => this.switchCamera());
    }
    window.addEventListener('load', () => {
      this.checkCameraSupport();
      // Mensaje para navegadores móviles sin soporte
      if (!window.FileReader || !window.URL || !window.Blob) {
        this.showError('Tu navegador móvil no soporta la selección de archivos. Usa Chrome, Firefox o Safari actualizado.');
      }
    });
    [this.startBtn, this.stopBtn, this.switchCameraBtn].forEach(btn => {
      if (!btn) return;
      btn.setAttribute('tabindex', '0');
      btn.setAttribute('role', 'button');
      btn.setAttribute('aria-pressed', 'false');
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          btn.click();
        }
      });
    });
  }
  async checkCameraSupport() {
    try {
      const devices = await QrScanner.listCameras(true);
      console.log('Cámaras disponibles:', devices);
      if (devices.length === 0) {
        console.warn('No se encontraron cámaras');
      }
    } catch (err) {
      console.error('Error al verificar cámaras:', err);
    }
  }
  async startCamera() {
    try {
      this.hideAllMessages();
      this.showLoading('Iniciando cámara...');
      if (this.qrScanner) {
        this.qrScanner.destroy();
        this.qrScanner = null;
      }
      this.cameras = await QrScanner.listCameras(true);
      if (!this.cameras || this.cameras.length === 0) {
        throw new Error('No se encontraron cámaras disponibles.');
      }
      if (this.currentCameraIndex >= this.cameras.length || this.currentCameraIndex < 0) {
        let backIndex = this.cameras.findIndex(cam =>
          cam.label.toLowerCase().includes('back') ||
          cam.label.toLowerCase().includes('environment')
        );
        this.currentCameraIndex = backIndex !== -1 ? backIndex : 0;
      }
      let videoElem = this.readerDiv.querySelector('video');
      if (!videoElem) {
        videoElem = document.createElement('video');
        videoElem.style.width = '100%';
        videoElem.style.height = 'auto';
        videoElem.style.maxHeight = '350px';
        videoElem.style.objectFit = 'cover';
        videoElem.setAttribute('aria-label', 'Vista previa de la cámara para escanear QR');
        this.readerDiv.innerHTML = '';
        this.readerDiv.appendChild(videoElem);
      }
      this.qrScanner = new QrScanner(
        videoElem,
        (result) => this.onScanSuccess(result.data),
        {
          preferredCamera: this.cameras[this.currentCameraIndex].id,
          highlightScanRegion: true,
          highlightCodeOutline: true,
          returnDetailedScanResult: true
        }
      );
      await this.qrScanner.start();
      this.isScanning = true;
      this.initialState.classList.add('hidden');
      this.readerContainer.classList.remove('hidden');
      this.readerDiv.setAttribute('aria-live', 'polite');
      this.readerDiv.setAttribute('aria-busy', 'false');
      this.readerDiv.style.outline = '2px solid #3b82f6';
      this.hideAllMessages();
    } catch (err) {
      console.error('Error starting camera:', err);
      let msg = 'No se pudo iniciar la cámara.';
      if (err && err.name === 'NotAllowedError') {
        msg = 'Permiso de cámara denegado. Permite el acceso a la cámara en tu navegador.';
      } else if (err && err.name === 'NotFoundError') {
        msg = 'No se encontró ninguna cámara en el dispositivo.';
      } else if (err && err.message) {
        msg += ' ' + err.message;
      }
      this.showError(msg);
    }
  }
  async stopCamera() {
    if (this.qrScanner && this.isScanning) {
      try {
        await this.qrScanner.stop();
        this.qrScanner.destroy();
      } catch (err) {
        console.log('Scanner already stopped');
      }
      this.qrScanner = null;
    }
    this.isScanning = false;
    this.readerContainer.classList.add('hidden');
    this.initialState.classList.remove('hidden');
    if (this.readerDiv) {
      this.readerDiv.innerHTML = '';
    }
  }
  async switchCamera() {
    if (!this.cameras || this.cameras.length < 2) {
      this.showError('No hay más de una cámara disponible para alternar.');
      return;
    }
    await this.stopCamera();
    this.currentCameraIndex = (this.currentCameraIndex + 1) % this.cameras.length;
    await this.startCamera();
  }
  async scanFromFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    await this.stopCamera();
    if (this.readerDiv) {
      this.readerDiv.innerHTML = '';
    }
    try {
      this.showLoading('Procesando imagen...');
      // Validar tipo de archivo en móviles
      if (!file.type.startsWith('image/')) {
        throw new Error('El archivo seleccionado no es una imagen.');
      }
      // Validar tamaño de archivo (ejemplo: 5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('La imagen es demasiado grande. Selecciona una imagen menor a 5MB.');
      }
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.src = url;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      const result = await QrScanner.scanImage(img, { returnDetailedScanResult: true });
      URL.revokeObjectURL(url);
      await this.onScanSuccess(result.data || result);
    } catch (err) {
      console.error('Error escaneando imagen QR:', err);
      let msg = 'No se pudo leer el archivo QR.';
      if (err && err.message && (err.message.includes('No QR code found') || err.message.includes('No QR code'))) {
        msg = 'No se detectó un código QR válido en la imagen.';
      } else if (err && err.message) {
        msg = err.message;
      }
      // Mensaje especial para móviles sin soporte
      if (/safari/i.test(navigator.userAgent) && !window.FileReader) {
        msg = 'Tu navegador móvil no soporta la selección de archivos. Usa Chrome, Firefox o Safari actualizado.';
      }
      this.showError(msg);
    } finally {
      this.fileInput.value = '';
    }
  }
  async onScanSuccess(decodedText) {
    // Prevención de doble escaneo en 2 segundos
    const now = Date.now();
    if (decodedText === this.lastScannedText && (now - this.lastScanTime) < 2000) {
      return;
    }
    this.lastScannedText = decodedText;
    this.lastScanTime = now;
    try {
      let data;
      try {
        data = JSON.parse(decodedText);
      } catch (e) {
        throw new Error('El código QR no tiene un formato válido.');
      }
      console.log('[QR LEÍDO]', data);
      this.validateQRCode(data);
      const formattedData = {
        qr_id: data.qr_id,
        visitor_name: data.name,
        document_id: data.id_document,
        resident_id: data.user_id,
        vehicle_plate: data.vehicle_plate,
        qr_type: data.qr_type,
        qr_data: data,
      };
      console.log('[OBJETO ENVIADO AL BACKEND]', formattedData);
      this.showLoading('Registrando visitante...');
      let response, result;
      try {
        response = await fetch('/api/scan-qr', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(formattedData)
        });
        result = await response.json();
      } catch (err) {
        // Soporte offline: error de red
        throw new Error('No se pudo conectar al servidor. Verifica tu conexión a internet.');
      }
      if (response.ok) {
        this.showSuccess(result.message || 'Visitante registrado correctamente');
        this.loadRecentScans();
        await this.stopCamera();
      } else {
        throw new Error(result.message || 'Error en el registro');
      }
    } catch (error) {
      let errorMessage = 'Código QR inválido o error en el registro.';
      if (error.message) {
        errorMessage = error.message;
      }
      this.showError(errorMessage);
      await this.stopCamera();
    }
  }
  validateQRCode(data) {
    // Validación de estructura QR
    const requiredFields = ['qr_id', 'name', 'id_document', 'user_id', 'qr_type'];
    for (const field of requiredFields) {
      if (!data[field]) {
        throw new Error(`El campo '${field}' falta en el código QR.`);
      }
    }
    const now = new Date();
    if (data.valid_until) {
      const expiration = new Date(data.valid_until);
      if (now > expiration) {
        throw new Error('El código QR ha expirado');
      }
    }
    return true;
  }
  async loadRecentScans() {
    try {
      const response = await fetch('/api/recent-visitor-scans', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('Error al cargar los escaneos recientes');
      }
      const visitors = await response.json();
      this.updateRecentScansTable(visitors);
    } catch (error) {
      console.error('Error loading recent scans:', error);
      this.showRecentScansError();
    }
  }
  updateRecentScansTable(visitors) {
    this.recentScansBody.innerHTML = '';
    if (visitors.length === 0) {
      this.recentScansBody.innerHTML = `
    <tr>
    <td colspan="5" class="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
    <svg class="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
    </svg>
    No hay escaneos recientes
    </td>
    </tr>
    `;
      return;
    }
    visitors.forEach(visitor => {
      const row = document.createElement('tr');
      row.className = 'hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors';
      row.innerHTML = `
      <td class="px-6 py-4 whitespace-nowrap">
      <div class="flex items-center">
      <div class="flex-shrink-0 w-8 h-8">
      <div class="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900">
      <svg class="w-4 h-4 text-primary-600 dark:text-primary-400" fill="currentColor" viewBox="0 0 20 20">
      <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path>
      </svg>
      </div>
      </div>
      <div class="ml-3">
      <div class="text-sm font-medium text-gray-900 dark:text-gray-100">${visitor.name}</div>
      </div>
      </div>
      </td>
      <td class="px-6 py-4 text-sm text-gray-500 whitespace-nowrap dark:text-gray-400">
      ${visitor.id_document}
      </td>
      <td class="px-6 py-4 text-sm text-gray-500 whitespace-nowrap dark:text-gray-400">
      ${visitor.user ? visitor.user.name : 'N/A'}
      </td>
      <td class="px-6 py-4 text-sm text-gray-500 whitespace-nowrap dark:text-gray-400">
      ${new Date(visitor.entry_time).toLocaleString()}
      </td>
      <td class="px-6 py-4 text-sm text-gray-500 whitespace-nowrap dark:text-gray-400">
      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${visitor.vehicle_plate ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}">
      ${visitor.vehicle_plate || 'Sin vehículo'}
      </span>
      </td>
      `;
      this.recentScansBody.appendChild(row);
    });
  }
  showRecentScansError() {
    this.recentScansBody.innerHTML = `
    <tr>
    <td colspan="5" class="px-6 py-4 text-center text-red-500 dark:text-red-400">
    Error al cargar los escaneos recientes
    </td>
    </tr>
    `;
  }
  showSuccess(message) {
    this.hideAllMessages();
    this.showFilamentToast('success', '¡Éxito!', message);
  }
  showError(message) {
    this.hideAllMessages();
    this.showFilamentToast('danger', 'Error', message);
  }
  showLoading(message = 'Procesando código QR...') {
    this.hideAllMessages();
    this.showFilamentToast('info', 'Procesando', message);
  }
  showFilamentToast(type, title, message) {
    const toast = document.createElement('div');
    const toastId = 'toast-' + Date.now();
    toast.id = toastId;
    const baseStyles = {
      position: 'fixed',
      top: '24px',
      right: '24px',
      zIndex: '9999',
      maxWidth: '380px',
      minWidth: '320px',
      padding: '16px',
      borderRadius: '12px',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      backdropFilter: 'blur(8px)',
      transform: 'translateX(100%)',
      opacity: '0',
      transition: 'all 0.3s ease-in-out',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    };
    const colorStyles = {
      'success': {
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderColor: 'rgba(16, 185, 129, 0.3)',
        color: '#064e3b',
        iconColor: '#10b981'
      },
      'danger': {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderColor: 'rgba(239, 68, 68, 0.3)',
        color: '#7f1d1d',
        iconColor: '#ef4444'
      },
      'info': {
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: 'rgba(59, 130, 246, 0.3)',
        color: '#1e3a8a',
        iconColor: '#3b82f6'
      }
    };
    Object.assign(toast.style, baseStyles);
    const colors = colorStyles[type] || colorStyles['info'];
    toast.style.backgroundColor = colors.backgroundColor;
    toast.style.border = `1px solid ${colors.borderColor}`;
    toast.style.color = colors.color;
    const iconSVG = {
      'success': '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>',
      'danger': '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>',
      'info': '<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>'
    };
    toast.innerHTML = `
    <div style="display: flex; align-items: flex-start; gap: 12px;">
    <div style="flex-shrink: 0;">
    <svg style="width: 20px; height: 20px; color: ${colors.iconColor};" fill="currentColor" viewBox="0 0 20 20">
    ${iconSVG[type]}
    </svg>
    </div>
    <div style="flex: 1; min-width: 0;">
    <p style="font-size: 14px; font-weight: 600; margin: 0 0 4px 0; color: ${colors.color};">${title}</p>
    <p style="font-size: 12px; margin: 0; line-height: 1.4; color: ${colors.color}; opacity: 0.9;">${message}</p>
    </div>
    <button style="flex-shrink: 0; padding: 6px; margin: -6px; border-radius: 6px; border: none; background: transparent; cursor: pointer; transition: background-color 0.2s; color: ${colors.color}; opacity: 0.7;"
            onmouseover="this.style.backgroundColor='rgba(0,0,0,0.05)'; this.style.opacity='1';"
            onmouseout="this.style.backgroundColor='transparent'; this.style.opacity='0.7';"
            onclick="document.getElementById('${toastId}').remove()">
    <svg style="width: 16px; height: 16px;" fill="currentColor" viewBox="0 0 20 20">
    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
    </svg>
    </button>
    </div>
    `;
    let toastContainer = document.getElementById('custom-toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'custom-toast-container';
      Object.assign(toastContainer.style, {
        position: 'fixed',
        top: '24px',
        right: '24px',
        zIndex: '9999',
        width: 'auto',
        maxWidth: '400px',
        pointerEvents: 'none'
      });
      document.body.appendChild(toastContainer);
    }
    toast.style.pointerEvents = 'auto';
    toast.style.marginBottom = '12px';
    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.transform = 'translateX(0)';
      toast.style.opacity = '1';
    }, 100);
    const duration = type === 'info' ? 3000 : 5000;
    setTimeout(() => {
      toast.style.transform = 'translateX(100%)';
      toast.style.opacity = '0';
      setTimeout(() => {
        if (toast.parentElement) {
          toast.remove();
          if (toastContainer.children.length === 0) {
            toastContainer.remove();
          }
        }
      }, 300);
    }, duration);
  }
  hideAllMessages() {
    this.successMessage.classList.add('hidden');
    this.errorMessage.classList.add('hidden');
    this.loadingMessage.classList.add('hidden');
    this.messageArea.classList.add('hidden');
    if (this.readerDiv) {
      this.readerDiv.style.outline = '';
      this.readerDiv.removeAttribute('aria-busy');
    }
  }
}
document.addEventListener('DOMContentLoaded', () => {
  new QRScannerManager();
});
</script>
@endpush
</x-filament-panels::page>
