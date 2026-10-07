# Refatoração de Testes e Detecção de Test Smells

## Capa

Disciplina: Teste de Software  
Trabalho: Refatoração de Testes e Detecção de Test Smells  
Aluno: Athos Fonseca

---

## Análise de Smells

Os testes originais apresentam vários sinais de má qualidade. A seguir, três exemplos relevantes:

### 1. Eager Test
O teste "deve desativar usuários se eles não forem administradores" executa múltiplas ações em uma única unidade de teste: cria dois usuários, percorre uma lista, chama a lógica de desativação, verifica resultados condicionais e altera o estado do sistema ao mesmo tempo. Esse padrão torna o teste mais difícil de interpretar e mais frágil para manutenção.

Risco: quando algo falha, o diagnóstico fica confuso e o teste não aponta claramente qual comportamento específico quebrou.

### 2. Condicional Logic Inside Test
O mesmo teste usa if e for para decidir quais expectations serão executados conforme o tipo de usuário. Isso mistura lógica de fluxo com lógica de validação, quebrando o princípio de que o teste deve descrever apenas um comportamento esperado.

Risco: a leitura do teste se torna obscura e a intenção do comportamento fica escondida sob decisões de implementação.

### 3. Assertion Without Clear Failure Signal
O teste "deve falhar ao criar usuário menor de idade" usa try/catch e só verifica a exceção no bloco de captura. Esse padrão pode passar silenciosamente se a validação for removida e a função continuar sem falhar, porque o fluxo de erro não é tratado como um comportamento explícito do sistema.

Risco: o teste deixa um bug invisível para a suíte, pois a ausência de falha pode ser interpretada como sucesso mesmo quando a regra de negócio está quebrada.

---

## Processo de Refatoração

### Antes

```js
for (const user of todosOsUsuarios) {
  const resultado = userService.deactivateUser(user.id);
  if (!user.isAdmin) {
    expect(resultado).toBe(true);
    const usuarioAtualizado = userService.getUserById(user.id);
    expect(usuarioAtualizado.status).toBe('inativo');
  } else {
    expect(resultado).toBe(false);
  }
}
```

### Depois

```js
test('desativa apenas usuários comuns e mantém administradores ativos', () => {
  const commonUser = userService.createUser('Maria', 'maria@teste.com', 28);
  const adminUser = userService.createUser('Admin', 'admin@teste.com', 35, true);

  expect(userService.deactivateUser(commonUser.id)).toBe(true);
  expect(userService.getUserById(commonUser.id).status).toBe('inativo');

  expect(userService.deactivateUser(adminUser.id)).toBe(false);
  expect(userService.getUserById(adminUser.id).status).toBe('ativo');
});
```

As decisões tomadas na refatoração seguiram o padrão Arrange, Act, Assert e separaram claramente cada comportamento esperado. A lógica condicional foi removida do corpo do teste, deixando cada caso com foco único e frases descritivas.

---

## Relatório da Ferramenta

A análise automatizada com ESLint foi executada no arquivo original para confirmar os problemas de qualidade na suíte problemática. A primeira execução retornou os seguintes erros e avisos:

```bash
$ npx eslint test/userService.smelly.test.js

C:\Git\test-smelly\test\userService.smelly.test.js
  44:9  error    Avoid calling `expect` conditionally`  jest/no-conditional-expect
  46:9  error    Avoid calling `expect` conditionally`  jest/no-conditional-expect
  49:9  error    Avoid calling `expect` conditionally`  jest/no-conditional-expect
  73:7  error    Avoid calling `expect` conditionally`  jest/no-conditional-expect
  77:3  warning  Tests should not be skipped            jest/no-disabled-tests
  77:3  warning  Test has no assertions                 jest/expect-expect

✖ 6 problems (4 errors, 2 warnings)
```

Essa saída mostra como a ferramenta automatiza a detecção de smells e ajuda a encontrar problemas que podem passar despercebidos em uma revisão manual. Em especial, os erros de `jest/no-conditional-expect` reforçam que o código de teste estava misturando lógica de controle com validação.

---

## Conclusão

Testes limpos melhoram a compreensão, reduzem a fragilidade e aumentam a confiabilidade da suíte. A combinação de boas práticas de escrita com análise estática contribui diretamente para a sustentabilidade e manutenção de um projeto de software, permitindo que alterações futuras sejam realizadas com mais segurança e menos risco de regressão.
