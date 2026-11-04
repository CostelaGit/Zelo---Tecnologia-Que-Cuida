# Zelo — aceite do MVP

## Escopo entregue

- Onboarding adaptado aos perfis PCD, pessoa idosa, TEA e padrão.
- Modos visual padrão, simples, calmo e alto contraste.
- Preferências persistentes de fonte, contraste e redução de movimento.
- Leitura em voz alta usando a síntese de voz do navegador.
- Busca demonstrativa de unidades públicas e particulares.
- Catálogo completo de serviços, profissionais e horários.
- Autenticação demonstrativa por gov.br, Google e e-mail.
- Agendamento com profissional ou equipe, data, horário e revisão.
- Bloqueio de horários ocupados ou desabilitados pela unidade.
- Consultas futuras, histórico, comprovante e cancelamento.
- Agenda administrativa sincronizada com o paciente.
- Conclusão de atendimentos pelo painel.
- Disponibilidade administrativa por serviço e faixa de horário.
- Publicação de avisos da unidade refletida para o paciente.
- Marca Zelo aplicada ao onboarding, acesso, autenticação, cabeçalho,
  favicon e metadados sociais.

## Persistência demonstrativa

O protótipo usa `localStorage` para manter, no mesmo navegador:

- perfil e preferências de acessibilidade;
- identificação demonstrativa;
- unidade acessada e favoritos;
- agendamentos e respectivos estados;
- disponibilidade de serviços e horários;
- avisos publicados pela unidade.

## Matriz de aceite

| Fluxo | Resultado esperado |
| --- | --- |
| Abrir o app pela primeira vez | Exibe onboarding responsivo com a marca Zelo |
| Escolher perfil e modo | Abre a experiência do paciente e preserva a escolha |
| Buscar uma unidade | Filtra por nome, região, cidade, serviço e tipo |
| Abrir uma unidade | Exibe todos os serviços e o próximo horário livre |
| Agendar sem identificação | Preserva o rascunho durante a autenticação |
| Confirmar atendimento | Cria código, comprovante e item em Minhas consultas |
| Cancelar atendimento | Move para o histórico e libera o horário |
| Concluir no painel | Atualiza o histórico do paciente |
| Suspender serviço no painel | Impede novos agendamentos sem remover os existentes |
| Bloquear horário no painel | Remove o horário das opções do paciente |
| Publicar aviso | Exibe o comunicado na área do paciente |
| Recarregar a página | Mantém os dados demonstrativos no mesmo navegador |
| Usar teclado ou modo acessível | Mantém foco visível, controles nomeados e movimento reduzido |

## Limites do protótipo

As ações abaixo são intencionalmente simuladas e não usam serviços externos:

- login gov.br e Google;
- envio de e-mail, SMS e notificações push;
- geolocalização precisa;
- geração de PDF no servidor;
- comunicação entre navegadores, dispositivos ou usuários reais;
- autenticação e permissões administrativas reais.

## Requisitos para produção

Uma implantação real deve substituir a persistência local por dados duráveis e
controle de acesso no backend, incluindo usuários, unidades, profissionais,
serviços, disponibilidade, agendamentos, avisos e auditoria. Também deve integrar
provedores oficiais de identidade e comunicação, aplicar regras de privacidade,
LGPD, segurança operacional e monitoramento.

## Verificações técnicas

- TypeScript sem erros.
- Build de produção validado pelo fluxo do Figma Make.
- Rota pública `/` pré-renderizada como estática.
- Preview verificado em desktop e mobile.
- Imagens de marca otimizadas em WebP.
