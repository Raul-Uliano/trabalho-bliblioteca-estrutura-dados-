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

  rankingMaisEmprestados() {
    return Array.from(this.livros.values())
      .sort((a, b) => b.totalEmprestimos - a.totalEmprestimos);
  }
}

const biblioteca = new SistemaBiblioteca();

function mostrarMensagem(texto) {
  document.getElementById("mensagem").innerText = texto;
}

function cadastrarLivro() {
  const id = Number(document.getElementById("livroId").value);
  const titulo = document.getElementById("livroTitulo").value;
  const autor = document.getElementById("livroAutor").value;
  const quantidade = Number(document.getElementById("livroQuantidade").value);

  if (!id || !titulo || !autor || !quantidade) {
    mostrarMensagem("Preencha todos os dados do livro.");
    return;
  }

  biblioteca.cadastrarLivro(id, titulo, autor, quantidade);

  mostrarMensagem("Livro cadastrado com sucesso.");
  atualizarTela();
}

function cadastrarUsuario() {
  const id = Number(document.getElementById("usuarioId").value);
  const nome = document.getElementById("usuarioNome").value;

  if (!id || !nome) {
    mostrarMensagem("Preencha todos os dados do usuário.");
    return;
  }

  biblioteca.cadastrarUsuario(id, nome);

  mostrarMensagem("Usuário cadastrado com sucesso.");
  atualizarTela();
}

function emprestarLivro() {
  const idLivro = Number(document.getElementById("emprestimoLivroId").value);
  const idUsuario = Number(document.getElementById("emprestimoUsuarioId").value);

  const mensagem = biblioteca.emprestarLivro(idLivro, idUsuario);

  mostrarMensagem(mensagem);
  atualizarTela();
}

function devolverLivro() {
  const idLivro = Number(document.getElementById("devolucaoLivroId").value);
  const idUsuario = Number(document.getElementById("devolucaoUsuarioId").value);

  const mensagem = biblioteca.devolverLivro(idLivro, idUsuario);

  mostrarMensagem(mensagem);
  atualizarTela();
}

function atualizarTela() {
  listarLivros();
  listarUsuarios();
  listarEmprestimos();
  listarRanking();
}

function listarLivros() {
  const div = document.getElementById("listaLivros");
  const livros = biblioteca.listarLivros();

  if (livros.length === 0) {
    div.innerHTML = `<p class="vazio">Nenhum livro cadastrado.</p>`;
    return;
  }

  div.innerHTML = livros.map(livro => `
    <div class="item">
      <strong>ID:</strong> ${livro.id}<br>
      <strong>Título:</strong> ${livro.titulo}<br>
      <strong>Autor:</strong> ${livro.autor}<br>
      <strong>Disponíveis:</strong> ${livro.quantidade}
    </div>
  `).join("");
}

function listarUsuarios() {
  const div = document.getElementById("listaUsuarios");
  const usuarios = biblioteca.listarUsuarios();

  if (usuarios.length === 0) {
    div.innerHTML = `<p class="vazio">Nenhum usuário cadastrado.</p>`;
    return;
  }

  div.innerHTML = usuarios.map(usuario => `
    <div class="item">
      <strong>ID:</strong> ${usuario.id}<br>
      <strong>Nome:</strong> ${usuario.nome}
    </div>
  `).join("");
}

function listarEmprestimos() {
  const div = document.getElementById("listaEmprestimos");
  const emprestimos = biblioteca.listarEmprestimos();

  if (emprestimos.length === 0) {
    div.innerHTML = `<p class="vazio">Nenhum empréstimo ativo.</p>`;
    return;
  }

  div.innerHTML = emprestimos.map(emprestimo => `
    <div class="item">
      <strong>Livro:</strong> ${emprestimo.livro}<br>
      <strong>Usuário:</strong> ${emprestimo.usuario}<br>
      <strong>Data:</strong> ${emprestimo.data}
    </div>
  `).join("");
}

function listarRanking() {
  const div = document.getElementById("ranking");
  const ranking = biblioteca.rankingMaisEmprestados();

  if (ranking.length === 0) {
    div.innerHTML = `<p class="vazio">Nenhum livro no ranking.</p>`;
    return;
  }

  div.innerHTML = ranking.map((livro, index) => `
    <div class="item">
      <strong>${index + 1}º lugar</strong><br>
      <strong>Título:</strong> ${livro.titulo}<br>
      <strong>Autor:</strong> ${livro.autor}<br>
      <strong>Empréstimos:</strong> ${livro.totalEmprestimos}
    </div>
  `).join("");
}

biblioteca.cadastrarLivro(1, "Dom Casmurro", "Machado de Assis", 1);
biblioteca.cadastrarLivro(2, "O Pequeno Príncipe", "Antoine de Saint-Exupéry", 2);
biblioteca.cadastrarLivro(3, "Harry Potter", "J.K. Rowling", 1);

biblioteca.cadastrarUsuario(1, "Ana");
biblioteca.cadastrarUsuario(2, "Carlos");
biblioteca.cadastrarUsuario(3, "Marina");

atualizarTela();
