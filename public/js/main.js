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

  // Forwarders no escopo principal — encaminham para o stack via evento global,
  // permitindo `@click="showSuccess(...)"` em qualquer template sob `x-data="main()"`.
  Alpine.data('main', () => ({
    showSuccess: (message, duration = 5000) => window.showSuccess(message, duration),
    showError: (message, duration = 7000) => window.showError(message, duration),
    showWarning: (message, duration = 6000) => window.showWarning(message, duration),
    showInfo: (message, duration = 6000) => window.showInfo(message, duration)
  }));
});
