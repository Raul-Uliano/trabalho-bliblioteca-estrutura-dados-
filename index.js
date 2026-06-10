class Fila {
  constructor() {
    this.itens = [];
    this.inicio = 0;
  }

  entrar(valor) {
    this.itens.push(valor);
  }

  sair() {
    if (this.estaVazia()) return null;

    const valor = this.itens[this.inicio];
    this.inicio++;

    if (this.inicio > 10 && this.inicio * 2 > this.itens.length) {
      this.itens = this.itens.slice(this.inicio);
      this.inicio = 0;
    }

    return valor;
  }

  estaVazia() {
    return this.inicio >= this.itens.length;
  }

  listar() {
    return this.itens.slice(this.inicio);
  }
}

class SistemaBiblioteca {
  constructor() {
    this.livros = new Map();
    this.usuarios = new Map();
    this.emprestimos = [];
    this.filasEspera = new Map();
  }

  cadastrarLivro(id, titulo, autor, quantidade) {
    this.livros.set(id, {
      id,
      titulo,
      autor,
      quantidade,
      totalEmprestimos: 0
    });

    this.filasEspera.set(id, new Fila());
  }

  cadastrarUsuario(id, nome) {
    this.usuarios.set(id, {
      id,
      nome
    });
  }

  buscarLivro(id) {
    return this.livros.get(id) || null;
  }

  buscarUsuario(id) {
    return this.usuarios.get(id) || null;
  }

  emprestarLivro(idLivro, idUsuario) {
    const livro = this.buscarLivro(idLivro);
    const usuario = this.buscarUsuario(idUsuario);

    if (!livro) {
      return "Livro não encontrado.";
    }

    if (!usuario) {
      return "Usuário não encontrado.";
    }

    if (livro.quantidade > 0) {
      livro.quantidade--;
      livro.totalEmprestimos++;

      this.emprestimos.push({
        idLivro,
        idUsuario,
        data: new Date().toLocaleDateString("pt-BR")
      });

      return `${usuario.nome} emprestou o livro "${livro.titulo}".`;
    }

    this.filasEspera.get(idLivro).entrar(idUsuario);

    return `${usuario.nome} entrou na fila de espera do livro "${livro.titulo}".`;
  }

  devolverLivro(idLivro, idUsuario) {
    const livro = this.buscarLivro(idLivro);
    const usuario = this.buscarUsuario(idUsuario);

    if (!livro) {
      return "Livro não encontrado.";
    }

    if (!usuario) {
      return "Usuário não encontrado.";
    }

    const indice = this.emprestimos.findIndex(
      emprestimo => emprestimo.idLivro === idLivro && emprestimo.idUsuario === idUsuario
    );

    if (indice === -1) {
      return "Empréstimo não encontrado.";
    }

    this.emprestimos.splice(indice, 1);

    const fila = this.filasEspera.get(idLivro);

    if (!fila.estaVazia()) {
      const proximoUsuario = fila.sair();
      return this.emprestarLivro(idLivro, proximoUsuario);
    }

    livro.quantidade++;

    return `${usuario.nome} devolveu o livro "${livro.titulo}".`;
  }

  listarLivros() {
    return Array.from(this.livros.values());
  }

  listarUsuarios() {
    return Array.from(this.usuarios.values());
  }

  listarEmprestimos() {
    return this.emprestimos.map(emprestimo => {
      const livro = this.buscarLivro(emprestimo.idLivro);
      const usuario = this.buscarUsuario(emprestimo.idUsuario);

      return {
        livro: livro.titulo,
        usuario: usuario.nome,
        data: emprestimo.data
      };
    });
  }

  listarFilaEspera(idLivro) {
    const fila = this.filasEspera.get(idLivro);

    if (!fila) {
      return [];
    }

    return fila.listar().map(idUsuario => {
      const usuario = this.buscarUsuario(idUsuario);
      return usuario ? usuario.nome : "Usuário não encontrado";
    });
  }

  rankingMaisEmprestados() {
    return Array.from(this.livros.values())
      .sort((a, b) => b.totalEmprestimos - a.totalEmprestimos)
      .map(livro => ({
        titulo: livro.titulo,
        autor: livro.autor,
        totalEmprestimos: livro.totalEmprestimos
      }));
  }
}

const biblioteca = new SistemaBiblioteca();

biblioteca.cadastrarLivro(1, "Dom Casmurro", "Machado de Assis", 1);
biblioteca.cadastrarLivro(2, "O Pequeno Príncipe", "Antoine de Saint-Exupéry", 2);
biblioteca.cadastrarLivro(3, "Harry Potter", "J.K. Rowling", 1);

biblioteca.cadastrarUsuario(1, "Ana");
biblioteca.cadastrarUsuario(2, "Carlos");
biblioteca.cadastrarUsuario(3, "Marina");

console.log(biblioteca.emprestarLivro(1, 1));
console.log(biblioteca.emprestarLivro(1, 2));
console.log(biblioteca.emprestarLivro(2, 3));
console.log(biblioteca.devolverLivro(1, 1));

console.log("Livros cadastrados:");
console.log(biblioteca.listarLivros());

console.log("Usuários cadastrados:");
console.log(biblioteca.listarUsuarios());

console.log("Empréstimos ativos:");
console.log(biblioteca.listarEmprestimos());

console.log("Fila de espera do livro 1:");
console.log(biblioteca.listarFilaEspera(1));

console.log("Ranking dos livros mais emprestados:");
console.log(biblioteca.rankingMaisEmprestados());
