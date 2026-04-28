// Aguardar Alpine.js carregar para conectar os eventos globais
document.addEventListener('alpine:init', () => {
  Alpine.store('formatters', {
    formatarDataRelativa(isoString, agora = Date.now()) {
      const diff = agora - new Date(isoString).getTime();
      const min = Math.floor(diff / 60000);

      if (min < 1) return 'agora mesmo';
      if (min === 1) return 'há 1 min';
      if (min < 60) return `há ${min} min`;

      const h = Math.floor(min / 60);
      if (h === 1) return 'há 1 hora';
      if (h < 24) return `há ${h} horas`;

      const d = Math.floor(h / 24);
      return d === 1 ? 'há 1 dia' : `há ${d} dias`;
    }
  });

  // Tornar o sistema disponível globalmente usando eventos
  window.showNotification = function(message, type = 'success', duration = 5000) {
    window.dispatchEvent(new CustomEvent('show-notification', {
      detail: { message, type, duration }
    }));
  };

  window.showSuccess = (message, duration = 5000) => window.showNotification(message, 'success', duration);
  window.showError = (message, duration = 7000) => window.showNotification(message, 'danger', duration);
  window.showWarning = (message, duration = 6000) => window.showNotification(message, 'warning', duration);
  window.showInfo = (message, duration = 6000) => window.showNotification(message, 'info', duration);

  Alpine.data('main', () => ({
    notification: {
      show: false,
      message: '',
      type: 'success'
    },

    init() {
      // Escutar eventos globais
      window.addEventListener('show-notification', (event) => {
        const { message, type, duration } = event.detail;
        this.showNotification(message, type, duration);
      });
    },

    showNotification(message, type = 'success', duration = 5000) {
      this.notification.message = message;
      this.notification.type = type;
      this.notification.show = true;

      if (duration > 0) {
        setTimeout(() => {
          this.hideNotification();
        }, duration);
      }
    },

    hideNotification() {
      this.notification.show = false;
    },

    showSuccess(message, duration = 5000) {
      this.showNotification(message, 'success', duration);
    },

    showError(message, duration = 7000) {
      this.showNotification(message, 'danger', duration);
    },

    showWarning(message, duration = 6000) {
      this.showNotification(message, 'warning', duration);
    },

    showInfo(message, duration = 6000) {
      this.showNotification(message, 'info', duration);
    }
  }));
});
