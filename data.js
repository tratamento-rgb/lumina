// LUMINA · conteúdo
// Fotos: Unsplash (licença livre). Texto bíblico: João Ferreira de Almeida (domínio público), via bible-api.com.

const PHOTOS = {
  home:    "photo-1740606629927-05510dbc0db8",
  montes:  "photo-1758407909328-6b46fbfc5f98",
  lago:    "photo-1671120707012-0f8a38c71268",
  flores:  "photo-1566146991394-b09a95e80d17",
  maos:    "photo-1572867858976-0063067f8471",
  familia: "photo-1648221350871-e3ae3c8d0f58",
  familia2:"photo-1529180979161-06b8b6d6f2be",
  cafe:    "photo-1641516700730-99a54e7091a0",
  lua:     "photo-1514897575457-c4db467cf78e",
  trilha:  "photo-1626794174544-c3200f10e32b",
  mar:     "photo-1683799907575-ffa7ab5d269d",
  sol:     "photo-1505864681725-48344595127c",
  capuz:   "photo-1552729257-4591efcac057",
  colinas: "photo-1758483099119-5a079f683961"
};
const photoUrl = (key, w = 800) => `https://images.unsplash.com/${PHOTOS[key] || PHOTOS.home}?auto=format&fit=crop&w=${w}&q=72`;

// Capítulos com foto, reflexão e oração escritas à mão. Os outros usam um modelo simples.
const CURATED = {
  "PSA 23": {
    photo: "montes", script: "O Senhor<br><span>é o meu pastor</span>",
    pergunta: "Em que área da sua vida você precisa confiar mais na presença de Deus?",
    reflexao: "Davi foi pastor antes de ser rei. Sabia o que era passar a noite no campo, procurar água para o rebanho, espantar bicho com o cajado. Quando ele chama Deus de pastor, está falando de alguém que fica acordado por ele.",
    oracao: "Senhor, cuida de mim hoje. Me leva para onde tem descanso. E se o dia ficar escuro, fica perto. Amém."
  },
  "PSA 91": {
    photo: "lua", script: "Ele é o meu refúgio",
    pergunta: "O que você precisa entregar hoje nas mãos de Deus?",
    reflexao: "O salmo começa com quem habita, quem mora ali. A gente costuma correr para Deus só quando aperta, e depois volta para casa. Aqui a ideia é ficar.",
    oracao: "Pai, eu quero morar perto de ti, e não só aparecer quando aperta. Me guarda esta noite. Amém."
  },
  "ISA 43": {
    photo: "lago", script: "Eis que faço<br><span>uma coisa nova</span>",
    pergunta: "O que você ainda carrega que já devia ter ficado para trás?",
    reflexao: "Israel vivia contando a mesma história: o mar que abriu, a saída do Egito. Bonita, mas antiga. E Deus diz para eles pararem de olhar só para lá, porque ele ia fazer outra coisa, agora, no deserto onde estavam.",
    oracao: "Deus, eu solto o que passou. Me mostra o caminho que o Senhor já começou a abrir. Amém."
  },
  "PHP 4": {
    photo: "trilha", script: "Tudo posso",
    pergunta: "Qual preocupação de hoje você pode transformar em pedido?",
    reflexao: "Paulo estava preso quando escreveu essa carta, sem saber se ia sair vivo. E mesmo assim fala de contentamento. Ele não pede para a pessoa parar de sentir. Ele ensina o que fazer com o que sente: contar para Deus, com nome e tudo.",
    oracao: "Senhor, isso aqui está me tirando o sono. Eu te conto e te entrego. Guarda meu coração. Amém."
  },
  "PSA 40": {
    photo: "mar", script: "Esperei com paciência",
    pergunta: "Pelo que você está esperando há mais tempo?",
    reflexao: "No hebraico, o primeiro verso diz algo como \"esperando, esperei\". Davi insistiu. Clamou até ser ouvido, e quando foi, Deus se inclinou, como alguém que abaixa para escutar uma criança.",
    oracao: "Deus, me ensina a esperar sem desistir. Firma meus pés. Amém."
  },
  "ISA 41": {
    photo: "sol", script: "Não temas",
    pergunta: "Que medo você consegue dizer em voz alta agora?",
    reflexao: "Repara nos verbos: fortaleço, ajudo, sustento. Estão todos no presente. Isaías escreveu para gente longe de casa, sem garantia de volta.",
    oracao: "Pai, eu estou com medo. Segura a minha mão. Amém."
  },
  "MAT 11": {
    photo: "cafe", script: "Vinde a mim",
    pergunta: "Que peso você tem carregado sem dividir com ninguém?",
    reflexao: "Jugo era a peça de madeira que prendia dois bois lado a lado para puxar o arado. Um sozinho não aguenta. Jesus fala isso para gente esgotada de tanta regra.",
    oracao: "Jesus, eu cheguei cansado. Pega esse peso comigo. Amém."
  },
  "PSA 34": {
    photo: "capuz", script: "Perto de você",
    pergunta: "O que está doendo hoje?",
    reflexao: "Esse salmo tem uma anotação no começo: Davi escreveu depois de fingir loucura para escapar de um rei. Foi um dos piores dias da vida dele. Você não precisa estar bem para orar.",
    oracao: "Senhor, dói. Fica aqui comigo. Amém."
  },
  "JOS 24": {
    photo: "familia", script: "Eu e a minha casa",
    pergunta: "Por quem da sua família você quer orar hoje?",
    reflexao: "Josué já era velho quando disse isso, na frente de todo o povo. Tinha visto muita gente desistir no caminho. Decidiu por ele e pela casa dele, sem esperar que os outros decidissem primeiro.",
    oracao: "Senhor, eu e a minha casa queremos te servir. Cuida de cada um lá de casa, pelo nome. Amém."
  },
  "1CO 13": {
    photo: "familia2", script: "O amor é sofredor",
    pergunta: "Com quem você pode praticar uma dessas linhas esta semana?",
    reflexao: "Paulo escreveu isso para uma igreja que vivia brigando. Tenta ler de novo trocando \"o amor\" pelo seu nome. Algumas linhas ficam desconfortáveis, né?",
    oracao: "Deus, me dá paciência com quem eu amo. E coragem para pedir perdão primeiro. Amém."
  },
  "JER 29": {
    photo: "colinas", script: "Pensamentos de paz",
    pergunta: "O que você pode fazer hoje, onde você está?",
    reflexao: "Pouco antes desse versículo, Deus manda o povo exilado construir casas, plantar horta, casar, cuidar da cidade onde estavam presos. Eles iam ficar setenta anos ali. A promessa veio junto com trabalho para fazer.",
    oracao: "Senhor, eu não sei bem para onde estou indo. Mas confio que o Senhor sabe. Amém."
  },
  "PSA 100": {
    photo: "flores", script: "Entrai com louvor",
    pergunta: "Quais três coisas boas aconteceram hoje?",
    reflexao: "As portas eram a entrada do templo. Quem chegava, chegava agradecendo, antes de pedir qualquer coisa.",
    oracao: "Obrigado, Deus. Por hoje, pela comida na mesa, pelas pessoas que eu amo. Amém."
  }
};


// "Como está seu coração hoje?" · os 6 primeiros aparecem em cards, como no layout
const MOODS = [
  { id: "ansiedade", label: "Ansiedade", icon: "leaf", ref: "PHP 4", v: [6, 7],
    msg: "Antes de tudo: respira. Solta os ombros. Agora lê devagar o que Paulo escreveu de dentro de uma prisão." },
  { id: "recomeco", label: "Recomeço", icon: "heart", ref: "ISA 43", v: [18, 19],
    msg: "Talvez você esteja olhando muito para trás. Deus falou isso para um povo que só conseguia lembrar do que tinha perdido." },
  { id: "gratidao", label: "Gratidão", icon: "sun", ref: "PSA 100", v: [4, 5],
    msg: "Que bom que hoje é dia de agradecer. Antes de ler, pensa numa coisa pequena que deu certo esta semana." },
  { id: "relacionamentos", label: "Relacionamentos", icon: "heart", ref: "1CO 13", v: [4, 5, 6, 7],
    msg: "Paulo escreveu isso para uma igreja que vivia brigando. Lê pensando numa pessoa específica." },
  { id: "proposito", label: "Propósito", icon: "flower", ref: "JER 29", v: [11],
    msg: "Essa carta foi para gente que ia passar setenta anos longe de casa. A promessa chegou no meio da espera." },
  { id: "familia", label: "Família", icon: "house", ref: "JOS 24", v: [15],
    msg: "Josué disse isso sabendo que muita gente ia escolher diferente. Ele começou pela própria casa." },
  { id: "medo", label: "Medo", icon: "shield", ref: "ISA 41", v: [10],
    msg: "Isaías escreveu para gente exilada, sem garantia nenhuma. A frase que Deus repete é curta: não temas." },
  { id: "tristeza", label: "Tristeza", icon: "drop", ref: "PSA 34", v: [17, 18],
    msg: "Pode chorar. Davi chorava e escrevia. Esse salmo saiu de um dia muito ruim dele." },
  { id: "cansaco", label: "Cansaço", icon: "moon", ref: "MAT 11", v: [28, 29, 30],
    msg: "Jesus fez esse convite para gente exausta. Ninguém ali estava descansado." }
];

const PLANS = [
  { id: "recomeco7", title: "7 dias de Recomeço", sub: "Deixe o passado e viva o novo.", days: 7, photo: "lago", tags: ["populares", "desafios"],
    readings: ["ISA 43", "PSA 40", "PSA 23", "MAT 11", "PSA 34", "JER 29", "PHP 4"] },
  { id: "fe21", title: "21 dias de Fé", sub: "Fortaleça sua confiança em Deus.", days: 21, photo: "flores", tags: ["desafios"],
    readings: ["PSA 23", "ISA 41", "PSA 91", "PHP 4", "PSA 40", "MAT 11", "JER 29"] },
  { id: "proposito", title: "Vida com Propósito", sub: "Descubra seus dons e use para o bem.", days: 7, photo: "maos", tags: ["populares"],
    readings: ["JER 29", "PHP 4", "1CO 13", "PSA 100", "ISA 43", "PSA 23", "JOS 24"] },
  { id: "familia", title: "Família em Oração", sub: "Construa um lar firme na presença de Deus.", days: 7, photo: "familia", tags: ["novos"],
    readings: ["JOS 24", "1CO 13", "PSA 100", "PSA 91", "PSA 23", "MAT 11", "PSA 34"] },
  { id: "maisdeus", title: "Mais de Deus", sub: "Uma jornada para se aproximar d'Ele.", days: 7, photo: "cafe", tags: ["novos"],
    readings: ["PSA 23", "PSA 100", "PSA 40", "PSA 91", "ISA 43", "MAT 11", "JER 29"] },
  { id: "oracao30", title: "30 dias de Oração", sub: "Um pouco por dia, até virar hábito.", days: 30, photo: "lua", tags: ["desafios", "novos"],
    readings: ["PSA 91", "MAT 11", "PHP 4", "PSA 34", "PSA 23", "PSA 40", "ISA 41"] }
];

const DAILY = [
  ["ISA 43", [18, 19]], ["PSA 23", [1]], ["PHP 4", [13]], ["ISA 41", [10]],
  ["MAT 11", [28]], ["JER 29", [11]], ["PSA 91", [1, 2]], ["PSA 40", [1]], ["PSA 34", [18]]
];

const ACHIEVEMENTS = [
  { id: "first_read", title: "Primeira leitura", desc: "Você leu o primeiro capítulo." },
  { id: "first_prayer", title: "Primeira oração escrita", desc: "Seu diário começou." },
  { id: "first_note", title: "Primeira anotação", desc: "Guardou o que Deus falou." },
  { id: "first_share", title: "Primeiro versículo compartilhado", desc: "Alguém recebeu uma palavra por sua causa." },
  { id: "streak3", title: "3 dias seguidos", desc: "Começou pequeno. Está indo." },
  { id: "streak7", title: "7 dias seguidos", desc: "Uma semana inteira." },
  { id: "plan_done", title: "Primeiro plano concluído", desc: "Do primeiro ao último dia." }
];
