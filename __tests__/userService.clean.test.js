const { UserService } = require('../src/userService');

describe('UserService', () => {
  let userService;

  beforeEach(() => {
    userService = new UserService();
    userService._clearDB();
  });

  test('cria um usuário ativo com os dados informados', () => {
    const userData = {
      nome: 'Ana Silva',
      email: 'ana@teste.com',
      idade: 30,
    };

    const createdUser = userService.createUser(
      userData.nome,
      userData.email,
      userData.idade
    );

    expect(createdUser).toEqual(
      expect.objectContaining({
        nome: userData.nome,
        email: userData.email,
        idade: userData.idade,
        isAdmin: false,
        status: 'ativo',
      })
    );
    expect(createdUser.id).toEqual(expect.any(String));
    expect(userService.getUserById(createdUser.id)).toEqual(createdUser);
  });

  test('lança erro quando nome, email ou idade são inexistentes', () => {
    expect(() => userService.createUser('', 'ana@teste.com', 30)).toThrow(
      'Nome, email e idade são obrigatórios.'
    );
    expect(() => userService.createUser('Ana Silva', '', 30)).toThrow(
      'Nome, email e idade são obrigatórios.'
    );
    expect(() => userService.createUser('Ana Silva', 'ana@teste.com')).toThrow(
      'Nome, email e idade são obrigatórios.'
    );
  });

  test('lança erro quando o usuário é menor de idade', () => {
    expect(() => userService.createUser('João', 'joao@teste.com', 17)).toThrow(
      'O usuário deve ser maior de idade.'
    );
  });

  test('desativa apenas usuários comuns e mantém administradores ativos', () => {
    const commonUser = userService.createUser('Maria', 'maria@teste.com', 28);
    const adminUser = userService.createUser('Admin', 'admin@teste.com', 35, true);

    expect(userService.deactivateUser(commonUser.id)).toBe(true);
    expect(userService.getUserById(commonUser.id).status).toBe('inativo');

    expect(userService.deactivateUser(adminUser.id)).toBe(false);
    expect(userService.getUserById(adminUser.id).status).toBe('ativo');
  });

  test('gera relatório vazio quando não há usuários cadastrados', () => {
    expect(userService.generateUserReport()).toBe(
      '--- Relatório de Usuários ---\nNenhum usuário cadastrado.'
    );
  });

  test('gera relatório com os usuários cadastrados', () => {
    const firstUser = userService.createUser('Alice', 'alice@email.com', 28);
    const secondUser = userService.createUser('Bob', 'bob@email.com', 32);

    const report = userService.generateUserReport();

    expect(report.startsWith('--- Relatório de Usuários ---\n')).toBe(true);
    expect(report).toContain(
      `ID: ${firstUser.id}, Nome: Alice, Status: ativo\n`
    );
    expect(report).toContain(
      `ID: ${secondUser.id}, Nome: Bob, Status: ativo\n`
    );
  });
});
