// Configurações gerais da loja.
// Hoje ficam neste arquivo. Quando o painel admin existir (Etapa 6),
// estes valores passam a ser controlados por uma tela de configurações.
export const storeConfig = {
    // WhatsApp que recebe os pedidos: só números, com país e DDD.
    // Exemplo: 5511999999999  (55 = Brasil, 11 = DDD, depois o número)
    // TROCAR pelo número real da loja antes de publicar.
    whatsappNumber: '5511941469514',
  //JAO   whatsappNumber: '5511954265822',  
  
    // true  = mostra "Em estoque: X unidades" para o cliente
    // false = esconde a quantidade (o produto continua bloqueando ao esgotar)
    showStockCount: true,
  
    // Até quantas unidades o aviso aparece destacado como "estoque baixo"
    lowStockThreshold: 3,
  }