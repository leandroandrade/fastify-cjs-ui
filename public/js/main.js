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

  Alpine.notificadores = () => ({
    notificarSucesso(mensagem, duracao = 5000) {
      this.$dispatch('show-notification', { message: mensagem, type: 'success', duration: duracao });
    },
    notificarErro(mensagem, duracao = 7000) {
      this.$dispatch('show-notification', { message: mensagem, type: 'danger', duration: duracao });
    },
    notificarAviso(mensagem, duracao = 6000) {
      this.$dispatch('show-notification', { message: mensagem, type: 'warning', duration: duracao });
    },
    notificarInfo(mensagem, duracao = 6000) {
      this.$dispatch('show-notification', { message: mensagem, type: 'info', duration: duracao });
    }
  });

  Alpine.data('main', () => ({
    ...Alpine.notificadores()
  }));
});
