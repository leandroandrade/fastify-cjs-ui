function apiDemo() {
  return {
    ...Alpine.notificadores(),

    loading: false,
    response: null,
    name: '',

    async fetchHello() {
      this.loading = true;
      this.response = null;

      try {
        const url = this.name
          ? `/api/hello?name=${encodeURIComponent(this.name)}`
          : '/api/hello';

        const res = await fetch(url);
        const data = await res.json();

        this.response = data;

        this.notificarSucesso(data.message);
      } catch (error) {
        this.notificarErro('Erro ao buscar dados do servidor');
        console.error('Erro na requisição:', error);
      } finally {
        this.loading = false;
      }
    },

    clearResponse() {
      this.response = null;
      this.name = '';
    }
  };
}
