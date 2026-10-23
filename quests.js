// One presentation group per quest. Benefit tags below remain independent.
// Existing Exevo Pan entries keep its grouping; additional quests use their
// principal permanent benefit, with important hunting areas preceding bosses.
window.QUEST_LINEUPS = [
  { id: "djinn", name: "The Djinn War", quests: ["djinn-war-marid", "djinn-war-efreet"] },
  { id: "svargrond", name: "Svargrond", quests: ["barbarian-test", "ice-islands", "hunt-sea-serpent"] },
  { id: "zao", name: "Zao", quests: ["new-frontier", "tomes-knowledge", "children-revolution", "wrath-emperor"] },
  { id: "oramond", name: "Oramond", quests: ["rathleton-citizenship", "dark-trails", "hero-rathleton"] },
  { id: "vengoth", name: "Vengoth", quests: ["blood-brothers", "bloody-tusks"] },
  { id: "grimvale", name: "Grimvale", quests: ["grimvale", "curse-full-moon", "curse-spreads", "ancient-feud", "paradise-lost"] },
  { id: "demon-forge", name: "Demon Forge", quests: ["pits-inferno", "inquisition"] },
  { id: "warzones", name: "Warzones", quests: ["bigfoots-burden", "dangerous-depths", "too-hot-handle"] },
  { id: "asura-marapur", name: "Asura / Marapur", quests: ["lost-brother", "asura-palace", "within-tides", "shards-moon"] },
  { id: "library", name: "The Secret Library", quests: ["secret-library", "order-falcon", "liquid-death", "the-lament"] },
  { id: "grave-danger", name: "Grave Danger", quests: ["grave-danger", "order-cobra"] },
  { id: "soul-war", name: "Feaster of Souls / Soul War", quests: ["feaster-of-souls", "soul-war"] }
];

// Minimum / recommended levels from the Reddit megalist. Zero means no
// quest-wide minimum stated, not that all missions can be completed at level 0.
window.QUEST_ORDER_LEVELS = {
  "make-believe": [300, 800], "shards-moon": [400, 400],
  "rotten-blood": [250, 600], "no-rest-wicked": [250, 500],
  "soul-war": [250, 600], "primal-ordeal": [250, 400],
  "secret-library": [250, 500], "feaster-of-souls": [250, 300],
  "dream-courts": [250, 250], "grave-danger": [250, 300],
  "order-falcon": [250, 300], "order-cobra": [250, 300], "order-lion": [250, 250],
  "heart-destruction": [150, 250], "dangerous-depths": [100, 200],
  "bigfoots-burden": [80, 120], "cults-of-tibia": [8, 150],
  "forgotten-knowledge": [0, 200], "new-frontier": [70, 110],
  "wrath-emperor": [80, 130], "curse-spreads": [0, 100],
  "ice-islands": [0, 100], "20-years-cook": [250, 250],
  "shattered-isles": [35, 70], "postman": [0, 25],
  "barbarian-test": [0, 25], "explorer-society": [0, 110],
  "ape-city": [0, 130], "lions-rock": [0, 70], "twenty-miles-sea": [0, 100],
  "hunt-sea-serpent": [61, 61], "liquid-black": [0, 130], "grimvale": [0, 100],
  "shadows-yalahar": [75, 100], "blood-brothers": [40, 70],
  "tomes-knowledge": [0, 100], "children-revolution": [0, 70],
  "rathleton-citizenship": [0, 150], "dark-trails": [0, 150],
  "threatened-dreams": [8, 100], "too-hot-handle": [80, 300],
  "within-tides": [0, 200], "between-lines": [200, 200], "order-stag": [250, 250],
  "measuring-tibia": [0, 0], "pilgrimage-ashes": [0, 15], "paradox-tower": [30, 50],
  "djinn-war-marid": [40, 50], "djinn-war-efreet": [40, 50],
  "travelling-trader": [0, 50], "sweaty-cyclops": [0, 20],
  "secret-service": [50, 60], "thieves-guild": [0, 70], "krailos": [0, 100],
  "lost-brother": [0, 200], "killing-in-name": [6, 6],
  "opticording-sphere": [100, 150], "pits-inferno": [80, 130], "inquisition": [100, 150],
  "way-of-monk": [0, 275], "hero-rathleton": [0, 200], "asura-palace": [0, 200],
  "kilmaresh": [0, 250], "ferumbras-ascendant": [150, 250],
  "adventures-galthen": [250, 250], "cradle-monsters": [250, 250],
  "roost-graveborn": [450, 450], "curse-full-moon": [0, 100],
  "ancient-feud": [0, 100], "paradise-lost": [0, 200], "the-lament": [250, 500],
  "bloody-tusks": [250, 250], "podzilla": [300, 600], "liquid-death": [250, 500]
};

window.QUEST_DISPLAY_GROUPS = {
  utility: ["postman", "djinn-war-marid", "djinn-war-efreet", "travelling-trader", "thieves-guild", "shadows-yalahar", "pits-inferno", "inquisition", "way-of-monk"],
  access: ["barbarian-test", "lions-rock", "shattered-isles", "ice-islands", "twenty-miles-sea", "explorer-society", "blood-brothers", "new-frontier", "wrath-emperor", "ape-city", "threatened-dreams", "rathleton-citizenship", "dark-trails", "asura-palace", "between-lines", "20-years-cook", "dream-courts", "secret-library", "roost-graveborn", "no-rest-wicked", "podzilla", "soul-war", "primal-ordeal", "rotten-blood", "make-believe"],
  boss: ["hero-rathleton", "cults-of-tibia", "curse-spreads", "grimvale", "bigfoots-burden", "kilmaresh", "within-tides", "heart-destruction", "adventures-galthen", "cradle-monsters", "feaster-of-souls", "dangerous-depths", "too-hot-handle", "ferumbras-ascendant", "bloody-tusks", "shards-moon", "order-cobra", "order-lion", "order-falcon", "order-stag"]
};

// Display-only stages: retain the reference's 42 base rows without treating
// an achievement for one Warzone as completion of the other Warzones.
window.QUEST_DISPLAY_STAGES = {
  "bigfoots-burden": [
    { name: "Bigfoot's Burden (Rank IV)", achievements: ["Honorary Gnome"] },
    { name: "Bigfoot's Burden (Free boss access)", achievements: ["Gnomish Art of War"] }
  ],
  "dangerous-depths": [
    { name: "Dangerous Depths (Warzone 4)", achievements: ["Buried the Baron"] },
    { name: "Dangerous Depths (Warzone 5)", achievements: ["His Days are Counted"] },
    { name: "Dangerous Depths (Warzone 6)", achievements: ["Duked it Out"] }
  ]
};

window.QUEST_CATALOG = [
  {
    id: "make-believe",
    name: "Make Believe Quest",
    year: "2026",
    priority: 1,
    categories: ["new", "boss"],
    level: "300 · recomendado 800",
    summary: "A grande quest do Summer Update 2026 e a rota mais nova para bosses de endgame.",
    unlocks: "A morte de Mimar Haffar abre a hunt e a base do culto; a batalha final de Phosphorus abre os atalhos de teleporte.",
    requirements: "Conteúdo de grupo para até 5 jogadores; confirme no anúncio o progresso registrado na linha da quest.",
    checkpoints: ["Acesso à hunt/base do culto após Mimar Haffar", "Teleportes/atalhos liberados após a batalha final de Phosphorus"],
    wiki: "https://tibiawiki.com.br/wiki/Make_Believe_Quest"
  },
  {
    id: "shards-moon",
    name: "Shards of a Broken Moon",
    year: "2026",
    priority: 1,
    categories: ["new", "hunt"],
    level: "250",
    summary: "Conteúdo novo de Oskayaat/Marapur e rotas para as áreas ligadas ao fragmento lunar.",
    unlocks: "Acesso à região da quest; área de hunt Forbidden Gardens depende de um requisito à parte.",
    requirements: "A quest libera a região, mas não prova sozinha o acesso à hunt das True Feverbloom Asura.",
    checkpoints: ["Achievement Forbidden Fruit confirmado para entrar em Forbidden Gardens"],
    wiki: "https://tibiawiki.com.br/wiki/Shards_of_a_Broken_Moon"
  },
  {
    id: "rotten-blood",
    name: "Rotten Blood Quest",
    year: "2023",
    priority: 1,
    categories: ["boss", "hunt"],
    level: "250 · recomendado 800+",
    summary: "Acesso ao conteúdo de Darklight e à sequência de bosses de Bakragore.",
    unlocks: "Blood Vestibule, Jaded Roots, Putrefactory, Gloom Pillars e Darklight Core; quatro descendentes e Bakragore.",
    requirements: "Para cada tentativa de Bakragore, é preciso reunir as quatro taints derrotando os descendentes.",
    checkpoints: ["Acesso ao Darklight Core confirmado", "As quatro taints disponíveis para a próxima tentativa"],
    wiki: "https://www.tibiawiki.com.br/wiki/Rotten_Blood_Quest"
  },
  {
    id: "no-rest-wicked",
    name: "No Rest for the Wicked",
    year: "2025",
    priority: 2,
    categories: ["boss", "hunt"],
    level: "250+ · recomendado 500+",
    summary: "Conteúdo de Azzilon com boss em grupo e uma rota de progressão até Doomforging.",
    unlocks: "Azzilon Castle e Castle Catacombs; Arbaziloth e acesso à Doomforging após vitória no modo difícil.",
    requirements: "Para usar a forja, confira a vitória difícil registrada e a escolha feita pelo grupo na sala final.",
    checkpoints: ["Acesso às catacumbas de Azzilon confirmado", "Doomforging aberta"],
    wiki: "https://tibiawiki.com.br/wiki/No_Rest_for_the_Wicked_Quest"
  },
  {
    id: "soul-war",
    name: "Soul War Quest",
    year: "2021",
    priority: 1,
    categories: ["boss", "hunt"],
    level: "250 · recomendado 800+",
    summary: "Acesso a Zarganash e às cinco regiões com bosses de Goshnar.",
    unlocks: "Claustrophobic Inferno, Mirrored Nightmare, Ebb and Flow, Furious Crater, Rotten Wasteland e Goshnar's Megalomania.",
    requirements: "Feaster of Souls é pré-requisito. Para cada tentativa do boss final, os cinco bosses de acesso precisam ser refeitos; progresso de acesso pode se perder ao sair da área.",
    checkpoints: ["Feaster of Souls confirmada", "Grupo tem acesso repetível às salas dos bosses"],
    wiki: "https://tibiawiki.com.br/wiki/Soul_War_Quest"
  },
  {
    id: "primal-ordeal",
    name: "Primal Ordeal Quest",
    year: "2022",
    priority: 1,
    categories: ["boss", "hunt"],
    level: "250 · recomendado 400+",
    summary: "Libera Gnomprona, uma das principais regiões de hunt de alto nível.",
    unlocks: "Crystal Enigma, Monster Graveyard e Sparkling Pools; conteúdo do Primal Menace e Hazard System.",
    requirements: "Acesso ao hub e progresso da quest são etapas distintas; confira se o acesso às hunts e ao boss está liberado.",
    checkpoints: ["Entrada de Gnomprona confirmada", "Primal Menace / Hazard System liberado"],
    wiki: "https://tibiawiki.com.br/wiki/Primal_Ordeal_Quest"
  },
  {
    id: "secret-library",
    name: "The Secret Library Quest",
    year: "2018",
    priority: 1,
    categories: ["boss", "hunt"],
    level: "250 · recomendado 400+",
    summary: "Acesso às seções elementais da biblioteca e à sequência de bosses.",
    unlocks: "Quatro bosses elementais e a batalha final contra The Scourge of Oblivion.",
    requirements: "Há progresso em etapas e pré-requisitos paralelos, incluindo trechos da Order of the Falcon.",
    checkpoints: ["Acesso às seções elementais confirmado", "Acesso à batalha final confirmado"],
    wiki: "https://tibiawiki.com.br/wiki/The_Secret_Library_Quest"
  },
  {
    id: "feaster-of-souls",
    name: "Feaster of Souls Quest",
    year: "2020",
    priority: 2,
    categories: ["boss", "hunt"],
    level: "250 · recomendado 400+",
    summary: "Uma linha de progressão importante por si só e requisito da Soul War.",
    unlocks: "Quatro dungeons, acesso ao boss The Pale Worm e pré-requisito para Soul War.",
    requirements: "Quest extensa com várias rotas e bosses; a linha concluída não garante tentativa atual do Pale Worm.",
    checkpoints: ["Acesso ao The Pale Worm confirmado"],
    wiki: "https://tibiawiki.com.br/wiki/Feaster_of_Souls_Quest"
  },
  {
    id: "dream-courts",
    name: "The Dream Courts",
    year: "2017",
    priority: 2,
    categories: ["boss", "hunt"],
    level: "250 · recomendado 400+",
    summary: "Acesso às áreas de sonhos e aos bosses da Court of Summer e Court of Winter.",
    unlocks: "Rotas de hunt e bosses ligados aos dois domínios dos Dream Courts.",
    requirements: "O progresso tem etapas em ambas as cortes; confira se o caminho para os bosses está aberto.",
    checkpoints: ["Court of Summer aberta", "Court of Winter aberta", "Acesso às salas de boss confirmado"],
    wiki: "https://tibiawiki.com.br/wiki/The_Dream_Courts_Quest"
  },
  {
    id: "grave-danger",
    name: "Grave Danger Quest",
    year: "2019",
    priority: 2,
    categories: ["boss"],
    level: "250 · recomendado 350+",
    summary: "Grande conjunto de bosses espalhados pelo mapa; também se cruza com a Order of the Cobra.",
    unlocks: "Bosses dos Lich-Knights, King Zelos e conteúdo da Cobra Bastion.",
    requirements: "Acesso a Vengoth pela Blood Brothers é necessário; alguns bosses e linhas têm progresso próprio.",
    checkpoints: ["Acesso a Vengoth confirmado", "Acesso ao King Zelos confirmado"],
    wiki: "https://tibiawiki.com.br/wiki/Grave_Danger_Quest"
  },
  {
    id: "order-falcon",
    name: "The Order of the Falcon",
    year: "2018",
    priority: 2,
    categories: ["boss", "hunt"],
    level: "250 · recomendado 300",
    summary: "Abre a fortaleza dos Falcon e o ciclo de bosses diários.",
    unlocks: "Falcon Bastion por Edron e Zao Steppe; Grand Master Oberon e outros bosses.",
    requirements: "O ritual de acesso à fortaleza depende do horário do jogo; ter iniciado a quest não confirma a entrada.",
    checkpoints: ["Entrada permanente ao Falcon Bastion confirmada", "Acesso ao Grand Master Oberon confirmado"],
    wiki: "https://tibiawiki.com.br/wiki/The_Order_of_the_Falcon_Quest"
  },
  {
    id: "order-cobra",
    name: "The Order of the Cobra",
    year: "2019",
    priority: 2,
    categories: ["boss"],
    level: "250 · recomendado 300+",
    summary: "Linha de boss relevante no Cobra Bastion e conectada a Grave Danger.",
    unlocks: "Gaffir, Custodian, Guard Captain Quaid e Scarlett Etzel.",
    requirements: "Algumas etapas se sobrepõem à Grave Danger; confirme o acesso e o progresso de Scarlett separadamente.",
    checkpoints: ["Acesso à Scarlett Etzel confirmado"],
    wiki: "https://tibiawiki.com.br/wiki/The_Order_of_the_Cobra_Quest"
  },
  {
    id: "order-lion",
    name: "The Order of the Lion",
    year: "2020",
    priority: 2,
    categories: ["boss", "qol"],
    level: "250 · recomendado 400+",
    summary: "Além dos bosses, libera serviços e acessos práticos em Bounac.",
    unlocks: "Boss Drume; depois de reportar a missão, título Hero of Bounac, depot, comerciantes e Ancient Lion Knight.",
    requirements: "Derrotar Drume e reportar a missão ao NPC Kesar The Younger.",
    checkpoints: ["Título Hero of Bounac recebido", "Acesso ao Ancient Lion Knight confirmado"],
    wiki: "https://tibiawiki.com.br/wiki/The_Order_of_the_Lion_Quest"
  },
  {
    id: "heart-destruction",
    name: "Heart of Destruction",
    year: "2016",
    priority: 2,
    categories: ["boss"],
    level: "250 · recomendado 350+",
    summary: "Hub de bosses elementais com progressão entre os encontros.",
    unlocks: "Anomaly, Rupture, Realityquake, World Devourer, Eradicator e Outburst.",
    requirements: "Há acesso permanente aos vórtices após derrotar criaturas; bosses adicionais abrem após progresso nos primeiros.",
    checkpoints: ["Vórtices permanentes liberados", "Eradicator e Outburst liberados"],
    wiki: "https://tibiawiki.com.br/wiki/Heart_of_Destruction_Quest"
  },
  {
    id: "dangerous-depths",
    name: "Dangerous Depths Quest",
    year: "2017",
    priority: 2,
    categories: ["boss", "hunt"],
    level: "100 · recomendado 250+",
    summary: "Desbloqueio escalonado das Warzones IV, V e VI.",
    unlocks: "Warzones IV–VI, seus bosses e a batalha final contra Ancient Spawn of Morgathla.",
    requirements: "Pontos de tasks diárias liberam cada Warzone; personagens com Bigfoot's Burden completa precisam de menos pontos.",
    checkpoints: ["Warzone IV liberada", "Warzone V liberada", "Warzone VI liberada"],
    wiki: "https://tibiawiki.com.br/wiki/Dangerous_Depths_Quest"
  },
  {
    id: "bigfoots-burden",
    name: "Bigfoot's Burden",
    year: "2012",
    priority: 2,
    categories: ["boss", "hunt", "qol"],
    level: "80 · grupo para bosses",
    summary: "Acesso à Gnomebase, Warzones clássicas e Large Crystal Teleporters.",
    unlocks: "Warzones I–III, bosses Deathstrike, Gnomevil e Abyssador; teleportes de cristal em cidades.",
    requirements: "A permissão para entrar nas Warzones pode ser temporária; entregar itens dos bosses no Rank IV habilita acesso vitalício.",
    checkpoints: ["Warzones I–III liberadas", "Acesso vitalício às Warzones confirmado", "Large Crystal Teleporters habilitados"],
    wiki: "https://tibiawiki.com.br/wiki/Bigfoot%27s_Burden_Quest"
  },
  {
    id: "cults-of-tibia",
    name: "Cults of Tibia",
    year: "2017",
    priority: 3,
    categories: ["boss"],
    level: "250",
    summary: "Conjunto de linhas curtas que abre bosses em diferentes cidades e áreas.",
    unlocks: "Encontros de cultos como Leiden, Ravenous Hunger e Essence of Malice, entre outros.",
    requirements: "A missão escolhida e os flags de boss variam por culto; uma linha concluída não significa que todos os bosses foram feitos.",
    checkpoints: ["Acesso aos bosses desejados conferido no anúncio"],
    wiki: "https://tibiawiki.com.br/wiki/Cults_of_Tibia_Quest"
  },
  {
    id: "forgotten-knowledge",
    name: "Forgotten Knowledge",
    year: "2017",
    priority: 3,
    categories: ["boss"],
    level: "250 · recomendado 350+",
    summary: "Série longa com sete bosses elementais e tentativas recorrentes.",
    unlocks: "Lloyd, Lady Tenebris, Frozen Horror, Thorn Knight, Zyrtarch, Time Guardian e Last Lore Keeper.",
    requirements: "Os acessos aos portais e bosses avançam por etapas e não devem ser presumidos apenas pela primeira missão.",
    checkpoints: ["Acesso aos portais elementais confirmado", "Acesso ao Last Lore Keeper confirmado"],
    wiki: "https://tibiawiki.com.br/wiki/Forgotten_Knowledge_Quest"
  },
  {
    id: "new-frontier",
    name: "The New Frontier",
    year: "2009",
    priority: 3,
    categories: ["hunt", "qol"],
    level: "0",
    summary: "Linha essencial para rotas e acesso a áreas de Zao.",
    unlocks: "Áreas de Zao, serviços e teleportes em Farmine; abre caminho para outras linhas locais.",
    requirements: "A quest tem pontos e missões internas; verifique os atalhos que o personagem realmente liberou.",
    checkpoints: ["Acesso ao tapete mágico de Zao confirmado", "Acesso às áreas relevantes de Zao confirmado"],
    wiki: "https://tibiawiki.com.br/wiki/The_New_Frontier_Quest"
  },
  {
    id: "wrath-emperor",
    name: "Wrath of the Emperor",
    year: "2010",
    priority: 3,
    categories: ["hunt", "boss"],
    level: "0 · recomendado 150+",
    summary: "Linha principal para acessar as áreas dos Drakens e o conteúdo de Zao.",
    unlocks: "Draken Walls e áreas internas do império; caminho até Zalamon.",
    requirements: "Várias missões e portões dependem do progresso da quest.",
    checkpoints: ["Entrada dos Draken Walls confirmada", "Acesso a Zalamon confirmado"],
    wiki: "https://tibiawiki.com.br/wiki/Wrath_of_the_Emperor_Quest"
  },
  {
    id: "curse-spreads",
    name: "The Curse Spreads",
    year: "2016",
    priority: 3,
    categories: ["hunt", "boss"],
    level: "250",
    summary: "Libera portais úteis entre Edron e Cormaya e permite repetir os bosses da linha.",
    unlocks: "Portais entre a caverna de Cormaya e Edron; novas tentativas dos bosses da linha após o cooldown.",
    requirements: "Requer o trecho de acesso da Grimvale Quest e acesso a Vengoth; progresso dos bosses é independente.",
    checkpoints: ["Portais entre Edron e Cormaya liberados", "Bosses da linha disponíveis para tentativa"],
    wiki: "https://tibiawiki.com.br/wiki/The_Curse_Spreads_Quest"
  },
  {
    id: "ice-islands",
    name: "The Ice Islands",
    year: "2007",
    priority: 3,
    categories: ["hunt", "qol"],
    level: "0",
    summary: "Acesso a Nibelor, ilhas bárbaras e rotas úteis no arquipélago.",
    unlocks: "Áreas de hunt nas Ice Islands e trechos necessários para outras quests.",
    requirements: "Acesso às ilhas e a algumas tarefas pode depender de missões locais.",
    checkpoints: ["Acesso a Nibelor confirmado", "Acesso às áreas bárbaras confirmado"],
    wiki: "https://tibiawiki.com.br/wiki/The_Ice_Islands_Quest"
  },
  {
    id: "20-years-cook",
    name: "20 Years a Cook",
    year: "2017",
    priority: 3,
    categories: ["hunt"],
    level: "0",
    summary: "Desbloqueia uma opção de hunt útil em Nimmersatt's Breeding Ground.",
    unlocks: "Entrada de Nimmersatt's Breeding Ground.",
    requirements: "É uma quest curta com um acesso específico; confira o estado da porta no anúncio.",
    checkpoints: ["Entrada de Nimmersatt's Breeding Ground confirmada"],
    wiki: "https://tibiawiki.com.br/wiki/20_Years_a_Cook_Quest"
  },
  {
    id: "shattered-isles",
    name: "The Shattered Isles",
    year: "2006",
    priority: 4,
    categories: ["hunt", "qol"],
    level: "0",
    summary: "Abre rotas e ilhas que servem de passagem para várias tarefas e hunts.",
    unlocks: "Goroma, Nargor e rotas relacionadas às ilhas piratas.",
    requirements: "Alguns destinos e passagens usam progresso de missão específico.",
    checkpoints: ["Acesso a Goroma e Nargor confirmado"],
    wiki: "https://tibiawiki.com.br/wiki/The_Shattered_Isles_Quest"
  },
  {
    id: "postman",
    name: "The Postman Missions",
    year: "2002",
    priority: 4,
    categories: ["qol"],
    level: "0",
    summary: "Uma das linhas de qualidade de vida mais úteis para viajar pelo mapa.",
    unlocks: "Viagens de barco mais baratas, acesso a mailboxes e serviços do Post Office.",
    requirements: "Não abre boss de alto nível; entra como valor de conveniência e rotas.",
    checkpoints: ["Serviços e rotas do Post Office liberados"],
    wiki: "https://tibiawiki.com.br/wiki/The_Postman_Missions_Quest"
  }
];

// Extended from every distinct quest/questline in the Reddit access, QoL and
// boss meg list. Completion still requires an exact official Bazaar quest line
// (or one of the explicit Exevo Pan completion tokens below).
window.QUEST_CATALOG.push(
  {
    id: "barbarian-test", name: "The Barbarian Test", year: "2007", priority: 3, categories: ["qol", "hunt"], level: "0–25",
    summary: "Abre a cidadania de Svargrond e é um dos primeiros passos das Ice Islands.",
    unlocks: "Viagem com Buddel, arena de Svargrond e início da The Ice Islands Quest.",
    requirements: "Honorary Barbarian confirma a conclusão e é o marcador Exevo usado para esta quest; o snapshot pode não exibir a linha oficial em personagens antigos.",
    checkpoints: ["Cidadania de Svargrond e viagem com Buddel liberadas"],
    questLineNames: ["The Barbarian Test", "Barbarian Test", "The Barbarian Test Quest"],
    wiki: "https://tibiawiki.com.br/wiki/Barbarian_Test_Quest"
  },
  {
    id: "explorer-society", name: "The Explorer Society", year: "2005", priority: 2, categories: ["hunt", "qol"], level: "0–110+",
    summary: "Acesso a Calassa, Frozen Trench e rotas de teleporte entre cidades.",
    unlocks: "Acesso a Calassa/Frozen Trench e aos teleportes Port Hope–Northport e Liberty Bay–Svargrond.",
    requirements: "Os ranks e missões internas são independentes; o achievement Explorer prova uma missão específica, não todos os acessos.",
    checkpoints: ["Acesso a Calassa e Frozen Trench confirmado", "Teleportes da Explorer Society liberados"],
    questLineNames: ["The Explorer Society", "Explorer Society", "The Explorer Society Quest"],
    wiki: "https://tibiawiki.com.br/wiki/The_Explorer_Society_Quest"
  },
  {
    id: "ape-city", name: "The Ape City", year: "2005", priority: 2, categories: ["hunt"], level: "0–130+",
    summary: "Acesso à Forbidden Lands e às áreas profundas de Banuta.",
    unlocks: "Forbidden Lands of Tiquanda, Deeper Banuta, Shaman Outfit e comércio com Hairycles.",
    requirements: "A outfit e o achievement são indícios de progresso; somente a linha oficial fecha o status automaticamente.",
    checkpoints: ["Forbidden Lands abertas", "Acesso a Deeper Banuta confirmado"],
    questLineNames: ["The Ape City", "Ape City", "The Ape City Quest"],
    wiki: "https://tibiawiki.com.br/wiki/The_Ape_City_Quest"
  },
  {
    id: "lions-rock", name: "Lion's Rock", year: "2013", priority: 3, categories: ["hunt"], level: "0–70",
    summary: "Libera o santuário interior de Lion's Rock e a hunt de Roaring Lions.",
    unlocks: "Inner Sanctum por teleporte, Ancient Scarabs, Roaring Lions e possibilidade de obter Noble Lion.",
    requirements: "Lion's Den Explorer é a conquista de conclusão; a Noble Lion Mount pode vir de outro jogador e não confirma acesso.",
    checkpoints: ["Inner Sanctum aberto"],
    questLineNames: ["Lion's Rock", "Lion's Rock Quest"],
    wiki: "https://tibiawiki.com.br/wiki/Lion%27s_Rock_Quest"
  },
  {
    id: "twenty-miles-sea", name: "Twenty Miles Beneath the Sea", year: "2012", priority: 2, categories: ["hunt"], level: "0–100+",
    summary: "Acesso a uma área de hunt exclusiva de Seacrest Serpents em Oramond.",
    unlocks: "Seacrest Grounds e seu spawn de Seacrest Serpents.",
    requirements: "Kills de criaturas aquáticas são históricas; não comprovam entrada atual após eventual rook.",
    checkpoints: ["Entrada de Seacrest Grounds confirmada"],
    questLineNames: ["Twenty Miles Beneath the Sea", "Twenty Miles Beneath the Sea Quest"],
    wiki: "https://tibiawiki.com.br/wiki/Twenty_Miles_Beneath_the_Sea_Quest"
  },
  {
    id: "hunt-sea-serpent", name: "The Hunt for the Sea Serpent", year: "2007", priority: 3, categories: ["hunt"], level: "61",
    summary: "Acesso aos spawns de Sea Serpents em Svargrond.",
    unlocks: "Áreas de caça de Sea Serpents no arquipélago de Hrodmir.",
    requirements: "A presença de Sea Serpent no Bestiary não identifica em qual spawn a criatura foi morta.",
    checkpoints: ["Spawn de Sea Serpents em Svargrond acessível"],
    questLineNames: ["The Hunt for the Sea Serpent", "Hunt for the Sea Serpent", "The Hunt for the Sea Serpent Quest"],
    wiki: "https://tibiawiki.com.br/wiki/The_Hunt_for_the_Sea_Serpent_Quest"
  },
  {
    id: "liquid-black", name: "Liquid Black", year: "2011", priority: 2, categories: ["hunt", "boss"], level: "0–130+",
    summary: "Abre níveis profundos de Fiehonja e os bosses Deepling Guardians.",
    unlocks: "Deepling Guardians Tanjis, Obujos e Jaul; partes profundas da hunt e Deepling Outfit.",
    requirements: "Cada boss prova uma etapa histórica; a próxima tentativa pode depender do estado atual do mundo.",
    checkpoints: ["Acesso aos Deepling Guardians confirmado", "Acesso às áreas profundas de Fiehonja confirmado"],
    questLineNames: ["Liquid Black", "Liquid Black Quest"],
    wiki: "https://tibiawiki.com.br/wiki/Liquid_Black_Quest"
  },
  {
    id: "grimvale", name: "Grimvale", year: "2016", priority: 2, categories: ["hunt", "boss"], level: "0–200+",
    summary: "Quatro ramos da linha abrem bosses de lua cheia, áreas de lobisomens e o caminho até Oskayaat.",
    unlocks: "Curse of the Full Moon, The Curse Spreads, An Ancient Feud e Paradise Lost; Oskayaat depende também de requisitos de outras linhas.",
    requirements: "As missões internas abrem conteúdos diferentes. Um ramo concluído não confirma os demais.",
    checkpoints: ["Curse of the Full Moon: acesso a Feroxa/Owin", "The Curse Spreads: portais e bosses liberados", "An Ancient Feud: bosses de Grimvale liberados", "Paradise Lost: bosses e rota para Oskayaat liberados"],
    questLineNames: ["Grimvale", "Grimvale Quest"],
    wiki: "https://tibiawiki.com.br/wiki/Grimvale_Quest"
  },
  {
    id: "shadows-yalahar", name: "Shadows of Yalahar", year: "2009", priority: 2, categories: ["hunt", "qol"], level: "75–100+",
    summary: "Acesso a Modified Gnarlhounds para treino e às trocas com Telas.",
    unlocks: "Modified Gnarlhounds, Golem Wrench e serviços de Telas.",
    requirements: "O Bazaar lista Shadows of Yalahar como uma linha concluída; não confundir com In Service of Yalahar.",
    checkpoints: ["Entrada dos Modified Gnarlhounds confirmada", "Comércio com Telas liberado"],
    questLineNames: ["Shadows of Yalahar", "Shadows of Yalahar Quest"],
    wiki: "https://tibiawiki.com.br/wiki/Shadows_of_Yalahar_Quest"
  },
  {
    id: "blood-brothers", name: "Blood Brothers", year: "2009", priority: 2, categories: ["hunt", "boss"], level: "40–70+",
    summary: "Libera a rota do castelo de Vengoth, pré-requisito para linhas posteriores.",
    unlocks: "Vengoth's Castle e progresso do Yalaharian Outfit.",
    requirements: "Bloody Tusks requer avanço até a missão 4; a conclusão final da linha não deve ser confundida com esse checkpoint.",
    checkpoints: ["Acesso a Vengoth confirmado", "Missão 4 reportada para Bloody Tusks"],
    questLineNames: ["Blood Brothers", "Blood Brothers Quest"],
    wiki: "https://tibiawiki.com.br/wiki/Blood_Brothers_Quest"
  },
  {
    id: "tomes-knowledge", name: "Tomes of Knowledge", year: "2010", priority: 2, categories: ["hunt", "qol"], level: "0–100+",
    summary: "Ramo de Zao ligado à entrega de tomos, aos teleportes e ao comércio local.",
    unlocks: "Snake teleporter após mais de 7 tomos, Corruption Hole após 8 e Zao Palace após 10 entregues.",
    requirements: "Contar os tomos é diferente de ter a quest line New Frontier completa; os níveis de acesso exigem entrega ao Cael.",
    checkpoints: ["Mais de 7 tomos entregues: snake teleporter", "8 tomos entregues: Corruption Hole", "10 tomos entregues: Zao Palace"],
    questLineNames: ["Tomes of Knowledge", "Tomes of Knowledge Quest"],
    wiki: "https://tibiawiki.com.br/wiki/Tomes_of_Knowledge_Quest"
  },
  {
    id: "children-revolution", name: "Children of the Revolution", year: "2010", priority: 2, categories: ["hunt", "boss"], level: "0–70+",
    summary: "Abre o caminho para Wrath of the Emperor e o boss semanal Lizard Gate Guardian.",
    unlocks: "Requisito para iniciar Wrath of the Emperor, segundo addon Warmaster e Lizard Gate Guardian.",
    requirements: "O avanço completo é necessário para iniciar Wrath; acesso do boss semanal é uma etapa separada.",
    checkpoints: ["Quest completa para iniciar Wrath of the Emperor", "Lizard Gate Guardian liberado"],
    questLineNames: ["Children of the Revolution", "Children of the Revolution Quest"],
    wiki: "https://tibiawiki.com.br/wiki/Children_of_the_Revolution_Quest"
  },
  {
    id: "rathleton-citizenship", name: "Rathleton Citizenship", year: "2014", priority: 3, categories: ["qol"], level: "0–150+",
    summary: "Cidadania abre votos, ranks, serviços e uma malha de teleportes de Rathleton.",
    unlocks: "Participação em votações/ranks e rotas locais conforme os pontos de Oramond.",
    requirements: "Rathleton Citizen confirma o rank de cidadão acompanhado pelo Exevo Pan; isso não prova pontuação maior nem todos os teleportes de Oramond.",
    checkpoints: ["Cidadania de Rathleton registrada", "Ranks/teleportes desejados disponíveis"],
    questLineNames: ["Rathleton Citizenship", "Rathleton (Citizenship)"],
    wiki: "https://tibiawiki.com.br/wiki/Rathleton_Quest"
  },
  {
    id: "dark-trails", name: "Dark Trails", year: "2015", priority: 2, categories: ["hunt", "boss"], level: "0–150+",
    summary: "Abre a dungeon de fúria de Oramond e o Glooth Engineer Outfit.",
    unlocks: "Oramond Fury Dungeon e missões ligadas à região.",
    requirements: "O outfit é evidência de progresso, não substitui a linha oficial como conclusão automática.",
    checkpoints: ["Entrada da Fury Dungeon confirmada"],
    questLineNames: ["Dark Trails", "Dark Trails Quest"],
    wiki: "https://tibiawiki.com.br/wiki/Dark_Trails_Quest"
  },
  {
    id: "threatened-dreams", name: "Threatened Dreams", year: "2015", priority: 2, categories: ["hunt", "qol", "boss"], level: "8–100",
    summary: "Abre Feyrist e Candia e inclui a missão A Dream Come True, fonte de itens de proteção.",
    unlocks: "Feyrist, Candia, Sugar Daddy/Sugar Mommy e itens Starlight Vial, Moon Mirror e Sun Catcher.",
    requirements: "Os itens de proteção são recompensa de missão; outfits e achievements individuais apenas indicam etapa.",
    checkpoints: ["Acesso a Feyrist", "Acesso a Candia", "Itens da missão A Dream Come True conferidos"],
    questLineNames: ["Threatened Dreams", "Threatened Dreams Quest"],
    wiki: "https://tibiawiki.com.br/wiki/Threatened_Dreams_Quest"
  },
  {
    id: "too-hot-handle", name: "Too Hot to Handle", year: "2018", priority: 1, categories: ["hunt", "boss"], level: "80–300+",
    summary: "Abre três hunts e dois bosses de alta relevância em Kilmaresh.",
    unlocks: "Antrum of the Fallen, Grotto of the Lost, Dwelling of the Forgotten, Mega Magmaoid, Brainstealer e compra de Eldritch Caskets.",
    requirements: "Some Like It Hot e bosses indicam progresso; acesso atual e tentativas devem ser confirmados separadamente.",
    checkpoints: ["Antrum of the Fallen", "Grotto of the Lost", "Dwelling of the Forgotten", "Mega Magmaoid e Brainstealer"],
    questLineNames: ["Too Hot to Handle", "Too Hot to Handle Quest"],
    wiki: "https://tibiawiki.com.br/wiki/Too_Hot_to_Handle_Quest"
  },
  {
    id: "within-tides", name: "Within the Tides", year: "2021", priority: 1, categories: ["hunt", "boss"], level: "0–200+",
    summary: "A principal linha de acesso a Marapur e pré-requisito para Primal Ordeal.",
    unlocks: "Marapur, Timira the Many-Headed, Giant Beaver mount e achievement Wedding Planner.",
    requirements: "Exige The Lost Brother; o item da montaria pode ser comprado e não prova acesso.",
    checkpoints: ["Acesso a Marapur", "Acesso a Timira confirmado", "Artifact mission liberada para Primal Ordeal"],
    questLineNames: ["Within the Tides", "Within the Tides Quest"],
    wiki: "https://tibiawiki.com.br/wiki/Within_the_Tides_Quest"
  },
  {
    id: "between-lines", name: "Between the Lines", year: "2021", priority: 1, categories: ["hunt", "boss"], level: "200+",
    summary: "Abre Book World, suas hunts e cinco bosses distribuídos entre Bane e Archfoe.",
    unlocks: "Book World, bosses Inkwing, Sir Leonard, Tropical Desolator, Blight Mariner e Wrathful Archivist; Illuminator Outfit.",
    requirements: "Nem todo boss faz parte do avanço obrigatório; uma kill prova etapa histórica, não disponibilidade atual.",
    checkpoints: ["Entrada no Book World", "Acesso a Inkwing/Sir Leonard", "Acesso aos três Archfoes"],
    questLineNames: ["Between the Lines", "Between the Lines Quest"],
    wiki: "https://tibiawiki.com.br/wiki/Between_the_Lines_Quest"
  },
  {
    id: "order-stag", name: "The Order of the Stag", year: "2021", priority: 2, categories: ["hunt", "boss"], level: "250",
    summary: "Abre a Isle of Ada e uma hunt/boss próprios da região.",
    unlocks: "Isle of Ada, hunting ground e Court Warlock.",
    requirements: "A morte de Court Warlock só prova que o boss foi alcançado em algum momento.",
    checkpoints: ["Acesso a Isle of Ada", "Acesso a Court Warlock"],
    questLineNames: ["The Order of the Stag", "Order of the Stag"],
    wiki: "https://tibiawiki.com.br/wiki/The_Order_of_the_Stag_Quest"
  },
  {
    id: "measuring-tibia", name: "Measuring Tibia", year: "2026", priority: 3, categories: ["new", "qol"], level: "0",
    summary: "O update recente adicionou velocidade e alertas de raid às áreas descobertas.",
    unlocks: "Bônus de velocidade e notificações de raids conforme o personagem revela áreas.",
    requirements: "Descobrir o mapa não equivale à conclusão da quest line; o Bazaar precisa exibir a linha para confirmação.",
    checkpoints: ["Quest line registrada no snapshot", "Áreas descobertas conferidas"],
    questLineNames: ["Measuring Tibia", "Measuring Tibia Quest"],
    wiki: "https://tibiawiki.com.br/wiki/Measuring_Tibia_Quest"
  },
  {
    id: "pilgrimage-ashes", name: "Pilgrimage of Ashes", year: "2007", priority: 4, categories: ["qol"], level: "0–15+",
    summary: "Rota inicial para obter todas as bênçãos com desconto de uma vez.",
    unlocks: "Desconto único de 1.000 gold nas bênçãos e recompensa em platinum coins abaixo do level 25.",
    requirements: "O desconto é usado ao comprar bênçãos e não fica exposto no snapshot; use a quest line como prova.",
    checkpoints: ["As cinco bênçãos visitadas"],
    questLineNames: ["Pilgrimage of Ashes", "Pilgrimage of Ashes Quest"],
    wiki: "https://tibiawiki.com.br/wiki/Pilgrimage_of_Ashes_Quest"
  },
  {
    id: "paradox-tower", name: "The Paradox Tower", year: "2004", priority: 4, categories: ["qol"], level: "30–50+",
    summary: "Recompensa Phoenix Egg, que reduz o custo da bênção Spark of the Phoenix.",
    unlocks: "Phoenix Egg e desconto recorrente na bênção enquanto o item estiver na backpack.",
    requirements: "O item não é exibido no snapshot do Bazaar; não inferir pela posse de montaria/outfit.",
    checkpoints: ["Quest line concluída e Phoenix Egg obtido"],
    questLineNames: ["The Paradox Tower", "Paradox Tower", "The Paradox Tower Quest"],
    wiki: "https://tibiawiki.com.br/wiki/The_Paradox_Tower_Quest"
  },
  {
    id: "djinn-war-marid", name: "The Djinn War (Marid/Blue)", year: "2004", priority: 3, categories: ["qol", "hunt"], level: "40–50+",
    summary: "Escolha da facção azul: abre negociação com Nah'Bob e Haroun e caça de Efreet.",
    unlocks: "Trocas com Nah'Bob/Haroun e acesso relacionado aos Blue Djinns.",
    requirements: "As duas facções são alternativas; a linha precisa identificar Marid para este ramo.",
    checkpoints: ["Facção Marid escolhida", "Comércio azul e rota de caça liberados"],
    questLineNames: ["The Djinn War - Marid Faction", "The Djinn War (Marid Faction)"],
    wiki: "https://tibiawiki.com.br/wiki/The_Djinn_War_Quest"
  },
  {
    id: "djinn-war-efreet", name: "The Djinn War (Efreet/Green)", year: "2004", priority: 3, categories: ["qol", "hunt"], level: "40–50+",
    summary: "Escolha da facção verde: abre negociação com Yaman e Alesar e caça de Marid.",
    unlocks: "Trocas com Yaman/Alesar e acesso relacionado aos Green Djinns.",
    requirements: "As facções são mutuamente exclusivas; só marque este ramo com a linha Efreet no snapshot.",
    checkpoints: ["Facção Efreet escolhida", "Comércio verde e rota de caça liberados"],
    questLineNames: ["The Djinn War - Efreet Faction", "The Djinn War (Efreet Faction)"],
    wiki: "https://tibiawiki.com.br/wiki/The_Djinn_War_Quest"
  },
  {
    id: "travelling-trader", name: "The Travelling Trader", year: "2004", priority: 4, categories: ["qol"], level: "0–50+",
    summary: "Linha de acesso ao NPC Rashid e à negociação em várias cidades.",
    unlocks: "Comércio com Rashid.",
    requirements: "Recognised Trader confirma o acesso a Rashid e é o marcador do Exevo Pan; o Bazaar não publica transações individuais.",
    checkpoints: ["Permissão para negociar com Rashid"],
    questLineNames: ["The Travelling Trader", "Travelling Trader", "The Travelling Trader Quest"],
    wiki: "https://tibiawiki.com.br/wiki/The_Travelling_Trader_Quest"
  },
  {
    id: "sweaty-cyclops", name: "The Sweaty Cyclops", year: "2004", priority: 4, categories: ["qol"], level: "0–20+",
    summary: "Permite trocar materiais e munição especial com A Sweaty Cyclops.",
    unlocks: "Piece of Royal/Draconian/Hell Steel, Huge Chunk of Crude Iron e Infernal Bolts.",
    requirements: "Trocas não aparecem no snapshot público; use a linha oficial para conclusão.",
    checkpoints: ["Negociações com A Sweaty Cyclops liberadas"],
    questLineNames: ["The Sweaty Cyclops", "Sweaty Cyclops", "The Sweaty Cyclops Quest"],
    wiki: "https://tibiawiki.com.br/wiki/The_Sweaty_Cyclops_Quest"
  },
  {
    id: "secret-service", name: "The Secret Service", year: "2008", priority: 3, categories: ["qol"], level: "50–60+",
    summary: "Linha de espionagem com recompensas diferentes de acordo com a agência escolhida.",
    unlocks: "Mysterious Package, Secret Agent e uma das medalhas Top AVIN Agent, Top CGB Agent ou Top TBI Agent.",
    requirements: "A medalha é exclusiva à escolha de agência; achievement isolado sinaliza progresso e não identifica todos os itens.",
    checkpoints: ["Agência escolhida identificada", "Pacote e recompensa final conferidos"],
    questLineNames: ["The Secret Service", "Secret Service", "The Secret Service Quest"],
    wiki: "https://tibiawiki.com.br/wiki/The_Secret_Service_Quest"
  },
  {
    id: "thieves-guild", name: "The Thieves Guild", year: "2005", priority: 3, categories: ["qol"], level: "0–70+",
    summary: "Abre comércio com Black Bert e itens raros ligados à guilda.",
    unlocks: "Comércio com Black Bert e escolha de Modified Crossbow, Spellbook of Warding ou Assassin Dagger.",
    requirements: "O item escolhido não é garantido por mounts/outfits; use a linha do Bazaar.",
    checkpoints: ["Comércio com Black Bert liberado"],
    questLineNames: ["The Thieves Guild", "Thieves Guild", "The Thieves Guild Quest"],
    wiki: "https://tibiawiki.com.br/wiki/The_Thieves_Guild_Quest"
  },
  {
    id: "krailos", name: "Krailos Quest", year: "2015", priority: 3, categories: ["qol", "hunt"], level: "0–100",
    summary: "Acesso ao depot de Krailos e aos NPCs da ilha.",
    unlocks: "Onyx Pendant, depot e comércio local.",
    requirements: "A área geográfica pode ser visitada sem concluir todos os serviços; linha e checkpoint são separados.",
    checkpoints: ["Depot de Krailos", "Comércio local liberado"],
    questLineNames: ["Krailos Quest", "Krailos"],
    wiki: "https://tibiawiki.com.br/wiki/Krailos_Quest"
  },
  {
    id: "lost-brother", name: "The Lost Brother", year: "2021", priority: 2, categories: ["qol", "hunt"], level: "0–200+",
    summary: "Linha de acesso e serviço em Asura Palace, além de pré-requisito para Within the Tides.",
    unlocks: "Comércio com Tarun; requisito para Within the Tides.",
    requirements: "A conclusão é requisito de Marapur, mas por si só não confirma a quest Within the Tides.",
    checkpoints: ["Quest concluída antes de iniciar Within the Tides"],
    questLineNames: ["The Lost Brother", "Lost Brother", "The Lost Brother Quest"],
    wiki: "https://tibiawiki.com.br/wiki/The_Lost_Brother_Quest"
  },
  {
    id: "killing-in-name", name: "Killing in the Name of...", year: "2008", priority: 3, categories: ["qol", "boss"], level: "6+",
    summary: "Sistema de tasks que libera bosses, o Grizzly Adams e viagens locais.",
    unlocks: "Bosses de tasks, comércio com Grizzly Adams, Lorek e Holy Icon após a task dos 6.666 Demons.",
    requirements: "O status agregado não mostra quais tasks repetíveis foram feitas nem se um boss está pronto para nova tentativa.",
    checkpoints: ["Tasks de boss desejadas liberadas", "Task de 6.666 Demons entregue"],
    questLineNames: ["Killing in the Name of...", "Killing in the Name of", "Killing in the Name of... Quest"],
    wiki: "https://tibiawiki.com.br/wiki/Killing_in_the_Name_of..._Quest"
  },
  {
    id: "opticording-sphere", name: "The Opticording Sphere", year: "2017", priority: 4, categories: ["qol"], level: "100–150+",
    summary: "Recompensa um teleportador de retorno com recarga de duas horas.",
    unlocks: "Supreme Cube, que teleporta o usuário para dentro e depois para Gray Beach.",
    requirements: "O item pode estar no inventário, mas essa ficha do Bazaar não publica inventário; só a linha confirma.",
    checkpoints: ["Supreme Cube obtido"],
    questLineNames: ["The Opticording Sphere", "Opticording Sphere", "The Opticording Sphere Quest"],
    wiki: "https://tibiawiki.com.br/wiki/The_Opticording_Sphere_Quest"
  },
  {
    id: "pits-inferno", name: "The Pits of Inferno", year: "2003", priority: 2, categories: ["hunt", "boss"], level: "80–130+",
    summary: "Abre o atalho do hub e a rota para completar a Inquisition.",
    unlocks: "Hub Shortcut e acesso ao caminho que antecede The Inquisition.",
    requirements: "Armas de recompensa são escolhas; o item recebido não é inferido pelo nome da quest.",
    checkpoints: ["Hub Shortcut", "Entrada da Inquisition"],
    questLineNames: ["The Pits of Inferno", "Pits of Inferno", "The Pits of Inferno Quest"],
    wiki: "https://tibiawiki.com.br/wiki/The_Pits_of_Inferno_Quest"
  },
  {
    id: "inquisition", name: "The Inquisition", year: "2007", priority: 2, categories: ["hunt", "boss"], level: "100–150+",
    summary: "Abre áreas profundas de Demon Forge, bosses e a Blessing of the Inquisition.",
    unlocks: "Demon Hunter Outfit/addons, bosses e escolha de uma recompensa de arma/equipamento.",
    requirements: "A outfit e as mortes de boss indicam avanço, mas não substituem a linha do Bazaar.",
    checkpoints: ["Áreas profundas da Demon Forge", "Blessing of the Inquisition"],
    questLineNames: ["The Inquisition", "Inquisition", "The Inquisition Quest"],
    wiki: "https://tibiawiki.com.br/wiki/The_Inquisition_Quest"
  },
  {
    id: "way-of-monk", name: "The Way of the Monk", year: "2025", priority: 2, categories: ["qol"], level: "0–275+",
    summary: "Exploração dos dez santuários concede Promotion Points e a achievement Hope of the Merudri.",
    unlocks: "10 Promotion Points, Hope of the Merudri e habilidades extras para Monks.",
    requirements: "Para não Monks, a parte verificável é a linha/recompensa; dano de auto attack não se aplica.",
    checkpoints: ["Dez santuários visitados", "Hope of the Merudri recebido"],
    questLineNames: ["The Way of the Monk", "Way of the Monk", "The Way of the Monk Quest"],
    wiki: "https://tibiawiki.com.br/wiki/The_Way_of_the_Monk_Quest"
  },
  {
    id: "hero-rathleton", name: "Hero of Rathleton", year: "2014", priority: 2, categories: ["hunt", "boss"], level: "0–200+",
    summary: "Abre a dungeon de Jaccus Maxxen e os bosses Deep Terror e Professor Maxxen.",
    unlocks: "Todas as áreas da dungeon de Jaccus Maxxen e seus bosses.",
    requirements: "Kills de boss são evidência parcial/histórica; o Bazaar não publica prontidão para uma nova tentativa.",
    checkpoints: ["Entrada da dungeon", "Deep Terror", "Professor Maxxen"],
    questLineNames: ["Hero of Rathleton", "Hero of Rathleton Quest"],
    wiki: "https://tibiawiki.com.br/wiki/Hero_of_Rathleton_Quest"
  },
  {
    id: "asura-palace", name: "Asura Palace", year: "2015", priority: 2, categories: ["hunt", "boss"], level: "0–200",
    summary: "Área de caça dos Asuras com três minibosses próprios.",
    unlocks: "The Moonlight Aster, The Winter Bloom e The Flaming Orchid.",
    requirements: "Dentro da hunt podem existir rotas com acesso separado; Lost Brother é outra linha e não deve ser presumida.",
    checkpoints: ["Acesso aos minibosses de Asura Palace"],
    questLineNames: ["Asura Palace", "Asura Palace Quest"],
    wiki: "https://tibiawiki.com.br/wiki/Asura_Palace_Quest"
  },
  {
    id: "kilmaresh", name: "Kilmaresh", year: "2019", priority: 2, categories: ["hunt", "boss"], level: "0–250+",
    summary: "Cidadania abre atalhos no sul de Kilmaresh e uma longa cadeia de minibosses.",
    unlocks: "Citizen of Issavi Outfit, atalhos e Urmahlullu the Immaculate, além de sete minibosses.",
    requirements: "Sun and Sea é o marcador Exevo para as quatro missões principais; outfit e bosses, isoladamente, são progresso.",
    checkpoints: ["Atalhos de Issavi/Kilmaresh", "Acesso a Urmahlullu"],
    questLineNames: ["Kilmaresh", "Kilmaresh Quest"],
    wiki: "https://tibiawiki.com.br/wiki/Kilmaresh_Quest"
  },
  {
    id: "ferumbras-ascendant", name: "Ferumbras' Ascendant", year: "2015", priority: 2, categories: ["boss"], level: "150–250+",
    summary: "A longa sequência culmina em Ferumbras Mortal Shell e libera várias batalhas semanais.",
    unlocks: "Dez bosses, Rift Warrior Outfit e chance de Ferumbras' Hat/Mysterious Scroll.",
    requirements: "Bosses e outfit revelam o avanço histórico; uma tentativa não fica garantida pelo histórico.",
    checkpoints: ["Acesso a Ferumbras Soul Splinter", "Acesso a Ascending Ferumbras", "Acesso a Ferumbras Mortal Shell"],
    questLineNames: ["Ferumbras' Ascendant", "Ferumbras' Ascension", "Ferumbras Ascendant", "Ferumbras Ascension"],
    wiki: "https://tibiawiki.com.br/wiki/Ferumbras%27_Ascendant_Quest"
  },
  {
    id: "adventures-galthen", name: "The Adventures of Galthen", year: "2021", priority: 2, categories: ["boss"], level: "250",
    summary: "Linha de exploração de Kilmaresh com quatro bosses associados ao avanço.",
    unlocks: "Megasylvan Yselda, Ahau, Atab e Mitmah Vanguard.",
    requirements: "A página da lista nota que novas missões podem ser adicionadas; trate completion line como o estado capturado no Bazaar.",
    checkpoints: ["Acesso a Megasylvan Yselda", "Acesso a Ahau/Atab", "Acesso a Mitmah Vanguard"],
    questLineNames: ["The Adventures of Galthen", "Adventures of Galthen", "The Adventures of Galthen Quest"],
    wiki: "https://tibiawiki.com.br/wiki/The_Adventures_of_Galthen_Quest"
  },
  {
    id: "cradle-monsters", name: "The Cradle of Monsters", year: "2022", priority: 2, categories: ["hunt", "boss"], level: "250",
    summary: "Abre Ingol, seu boss diário e serviços de Avan.",
    unlocks: "Ingol, Doctor Marrow, The Monster, comércio com Avan e Mutated Abomination mount.",
    requirements: "Montaria pode vir de outro jogador; boss é sinal de acesso histórico e não substitui a linha oficial.",
    checkpoints: ["Acesso a Ingol", "Boss diário disponível"],
    questLineNames: ["The Cradle of Monsters", "Cradle of Monsters", "The Cradle of Monsters Quest"],
    wiki: "https://tibiawiki.com.br/wiki/The_Cradle_of_Monsters_Quest"
  },
  {
    id: "roost-graveborn", name: "The Roost of the Graveborn", year: "2025", priority: 2, categories: ["hunt", "boss"], level: "450",
    summary: "Linha recente de alto nível que abre a batalha contra Bone Overlord.",
    unlocks: "Área do Graveborn e boss Bone Overlord.",
    requirements: "A morte registrada indica batalha histórica; conclusão automática exige a linha correspondente no snapshot.",
    checkpoints: ["Entrada do Roost", "Acesso a Bone Overlord"],
    questLineNames: ["The Roost of the Graveborn", "Roost of the Graveborn", "The Roost of the Graveborn Quest"],
    wiki: "https://tibiawiki.com.br/wiki/The_Roost_of_the_Graveborn_Quest"
  },
  {
    id: "curse-full-moon", name: "The Curse of the Full Moon", year: "2016", priority: 2, categories: ["boss", "hunt"], level: "0–100+",
    summary: "Ramo de Grimvale que libera o ciclo de lua cheia e a batalha de Feroxa.",
    unlocks: "Feroxa e Owin em condições de lua cheia.",
    requirements: "Over the Moon é o marcador Exevo de conclusão dos dois ramos de lua cheia; bosses são apenas evidência histórica.",
    checkpoints: ["Acesso a Feroxa durante lua cheia"],
    questLineNames: ["The Curse of the Full Moon", "Curse of the Full Moon", "The Curse of the Full Moon Quest"],
    wiki: "https://tibiawiki.com.br/wiki/The_Curse_of_the_Full_Moon_Quest"
  },
  {
    id: "ancient-feud", name: "An Ancient Feud", year: "2016", priority: 2, categories: ["boss", "hunt"], level: "0–100+",
    summary: "Ramo de Grimvale que permite enfrentar quatro bosses de were-creatures.",
    unlocks: "Katex Blood Tongue, Srezz Yellow Eyes, Utua Stone Sting e Yirkas Blue Scales.",
    requirements: "Drama in Darama é o marcador Exevo de conclusão deste ramo. As kills indicam avanço histórico e podem sobreviver a um rook; não contam como acesso atual.",
    checkpoints: ["Acesso aos quatro bosses da Ancient Feud"],
    questLineNames: ["An Ancient Feud", "An Ancient Feud Quest"],
    wiki: "https://tibiawiki.com.br/wiki/An_Ancient_Feud_Quest"
  },
  {
    id: "paradise-lost", name: "Paradise Lost", year: "2016", priority: 2, categories: ["boss", "hunt"], level: "0–200+",
    summary: "Ramo avançado de Grimvale ligado a Oskayaat e aos bosses de lua cheia.",
    unlocks: "Ayana the Crimson Curse e Tamru the Black durante lua cheia; requisito de acesso a Oskayaat em Grimvale.",
    requirements: "Oskayaat também exige Curse Spreads e An Ancient Feud; as mortes dos minibosses são históricas.",
    checkpoints: ["Curse Spreads concluída", "An Ancient Feud concluída", "Paradise Lost/Oskayaat liberado"],
    questLineNames: ["Paradise Lost", "Paradise Lost Quest"],
    wiki: "https://tibiawiki.com.br/wiki/Paradise_Lost_Quest"
  },
  {
    id: "the-lament", name: "The Lament", year: "2018", priority: 2, categories: ["hunt", "boss"], level: "250+",
    summary: "A missão das Asura Vaults abre acesso mais profundo e o item Bone Fiddle.",
    unlocks: "Acesso completo às Asura Vaults, The Diamond Blossom, The Blazing Rose e Bone Fiddle.",
    requirements: "O Bone Fiddle é item de quest e não aparece no resumo público do Bazaar; boss kills ficam como progresso histórico.",
    checkpoints: ["Acesso completo às Asura Vaults", "Bone Fiddle obtido"],
    questLineNames: ["The Lament", "The Lament Quest"],
    wiki: "https://tibiawiki.com.br/wiki/The_Lament_Quest"
  },
  {
    id: "bloody-tusks", name: "Bloody Tusks", year: "2025", priority: 2, categories: ["hunt", "boss"], level: "250–600+",
    summary: "Linha de Vengoth que abre Norcferatu Fortress, as dungeons e atalhos para a hunt e o boss Vladrukh.",
    unlocks: "Bloody Tusks, Norcferatu Fortress, atalhos e boss Vladrukh.",
    requirements: "Exige acesso a Vengoth até a missão 4 de Blood Brothers. Bat Person é um sinal específico de conclusão, mas só a quest line do Bazaar conclui automaticamente fora dos marcadores Exevo.",
    checkpoints: ["Acesso à Norcferatu Fortress", "Atalhos liberados", "Acesso a Vladrukh"],
    questLineNames: ["Bloody Tusks", "Bloody Tusks Quest"],
    wiki: "https://tibiawiki.com.br/wiki/Bloody_Tusks_Quest"
  },
  {
    id: "podzilla", name: "The Rise of Podzilla", year: "2024", priority: 2, categories: ["hunt", "boss"], level: "300–600+",
    summary: "Quest de Edron que abre Podzilla Bottom, Podzilla Maw, Podzilla Stalk e o boss The Rootkraken.",
    unlocks: "Hunts de Rootthings/Quaras, The Rootkraken e Rootwalker Outfit.",
    requirements: "Outfit e kill do boss registram recompensas/avanço, não substituem a quest line oficial para conclusão automática.",
    checkpoints: ["Acesso a Podzilla Bottom", "Acesso a Podzilla Maw/Stalk", "Acesso a The Rootkraken"],
    questLineNames: ["The Rise of Podzilla", "The Rise of Podzilla Quest", "Podzilla Quest"],
    wiki: "https://tibiawiki.com.br/wiki/The_Rise_of_Podzilla_Quest"
  },
  {
    id: "liquid-death", name: "Liquid Death (The Secret Library)", year: "2018", priority: 2, categories: ["boss"], level: "250–500+",
    summary: "Missão da Secret Library que libera Brokul e rende o artefato True Book of Death, usado na linha de Galthen.",
    unlocks: "Acesso à batalha de Brokul e o True Book of Death.",
    requirements: "A kill de Brokul é apenas histórica; somente uma quest line independente exibida como concluída no Bazaar pode concluir este card.",
    checkpoints: ["Acesso a Brokul", "True Book of Death obtido"],
    questLineNames: ["Liquid Death", "Liquid Death Quest"],
    wiki: "https://tibiawiki.com.br/wiki/The_Secret_Library_Quest"
  }
);

// Only explicit Exevo Pan achievement tokens may auto-complete outside the
// official completed quest line. Other markers are progress; creatures,
// Bosstiary kills, and mounts are weak historical clues.
window.QUEST_EVIDENCE = {
  "make-believe": {
    partial: { bosses: ["Mimar Haffar", "Maior Domus", "Phosphorus"], outfits: ["Illuminated Warrior"], mounts: ["Radiant Nimbus"] },
    creatures: ["Moonspawn Juggernaut", "Moonspawn Blightspitter", "Moonspawn Oozecrown"],
    checkpoints: [
      { index: 0, bosses: ["Mimar Haffar"] },
      { index: 1, bosses: ["Phosphorus"] }
    ],
    note: "A lista do Exevo Pan não tem um marcador para esta quest; conclusão automática exige a quest line. Bosses/outfit são progresso, enquanto Bestiary, Bosstiary e mount são indícios fracos. Mimar Haffar historicamente marca acesso à hunt; Phosphorus, aos atalhos, mas kills antigas não provam que esses acessos continuam após um rook."
  },
  "shards-moon": {
    partial: { achievements: ["Amati's Echo", "Forbidden Fruit"], bosses: ["Rakesh Moonfang", "The Moonsnow Magnolia"], mounts: ["Jaracal"] },
    creatures: ["True Feverbloom Asura", "True Frost Flower Asura", "True Midnight Asura"],
    checkpoints: [{ index: 0, achievements: ["Forbidden Fruit"] }],
    note: "Não há marcador desta quest na lista do Exevo Pan: só a quest line do Bazaar promove para concluída. Forbidden Fruit é evidência do acesso separado a Forbidden Gardens; Amati's Echo, bosses e Jaracal ficam como sinais de progresso. As True Asuras indicam passagem histórica pela Asura Citadel, mas não confirmam acesso atual."
  },
  "rotten-blood": {
    partial: { achievements: ["Fully Decayed"], bosses: ["Murcion", "Vemiath", "Chagorz", "Ichgahal", "Bakragore"], outfits: ["Decaying Defender"] },
    creatures: ["Darklight Striker"],
    note: "Rotten Blood não está entre os marcadores do Exevo Pan; conclusão automática exige quest line. Darklight Striker só aparece no Darklight Core, então ajuda como indício fraco. Outfit, Fully Decayed e kills não substituem a linha; taints para nova tentativa não são inferidas por histórico."
  },
  "no-rest-wicked": {
    partial: {
      achievements: ["Tear the Toxic Veil"],
      bosses: ["Gralvalon", "Malvaroth", "Twisterror", "Arbaziloth"],
      outfits: ["Fiend Slayer"]
    },
    checkpoints: [{ index: 0, achievements: ["Tear the Toxic Veil"] }],
    note: "Não há token específico no Exevo Pan: apenas a quest line do Bazaar marca conclusão. Tear the Toxic Veil prova rank alto e acesso do rank 5; o outfit e as kills são pistas de progresso. Doomforging depende de uma escolha do time não publicada no Bazaar."
  },
  "soul-war": {
    partial: {
      achievements: ["Unleash the Beast"],
      bosses: ["Goshnar's Malice", "Goshnar's Hatred", "Goshnar's Spite", "Goshnar's Cruelty", "Goshnar's Greed", "Goshnar's Megalomania"],
      outfits: ["Revenant"]
    },
    creatures: ["Bony Sea Devil", "Capricious Phantom", "Cloak Of Terror", "Courage Leech", "Distorted Phantom", "Druid's Apparition", "Infernal Demon", "Knight's Apparition", "Monk's Apparition", "Paladin's Apparition", "Rotten Golem", "Sorcerer's Apparition", "Turbulent Elemental"],
    note: "O Exevo Pan usa a quest line Soul War como marcador. Criaturas das áreas de Zarganash e kills de boss são indícios fracos de progresso; taints/condições para uma próxima tentativa não são inferidas pelo histórico. Revenant e Unleash the Beast não substituem a quest line."
  },
  "primal-ordeal": {
    partial: {
      bosses: ["Magma Bubble", "The Primal Menace"],
      outfits: ["Fire-Fighter"],
      mounts: ["Ripptor", "Noxious Ripptor"]
    },
    creatures: ["Nighthunter", "Stalking Stalk", "Sulphider", "Sulphur Spouter", "Undertaker", "Headpecker", "Mantosaurus", "Mercurial Menace", "Noxious Ripptor", "Shrieking Cry-Stal", "Emerald Tortoise", "Gore Horn", "Gorerilla", "Hulking Prehemoth", "Sabretooth"],
    note: "Primal Ordeal não está na lista do Exevo Pan: conclusão automática exige quest line. As criaturas listadas são de Gnomprona e viram indícios históricos fracos; Fire-Fighter, mounts e bosses são marcadores de progresso, não conclusão automática."
  },
  "secret-library": {
    exevoTracked: true,
    complete: { achievements: ["Library Liberator"] },
    partial: {
      achievements: ["Battle Mage", "Master Debater", "Millennial Falcon", "Spectulation"],
      bosses: ["Lokathmor", "Gorzindel", "Ghulosh", "Mazzinor", "The Scourge of Oblivion"],
      outfits: ["Battle Mage"],
      mounts: ["Fleeting Knowledge", "Flying Book"]
    },
    checkpoints: [
      { index: 0, achievements: ["Battle Mage"] },
      { index: 1, achievements: ["Library Liberator"], bosses: ["The Scourge of Oblivion"] }
    ],
    note: "Battle Mage marca a abertura da biblioteca; Library Liberator é dado ao derrotar o boss final."
  },
  "feaster-of-souls": {
    exevoTracked: true,
    complete: { achievements: ["Beyonder"] },
    partial: {
      achievements: ["Prospectre"],
      bosses: ["Brain Head", "Irgix the Flimsy", "Unaz the Mean", "Vok the Freakish", "Thaian", "The Unwelcome", "The Fear Feaster", "The Dread Maiden", "The Pale Worm"],
      outfits: ["Poltergeist"]
    },
    creatures: ["Brachiodemon"],
    note: "Beyonder é o marcador de conclusão que o Exevo Pan usa para Feaster of Souls; quest line também conta. Prospectre/bosses/outfit indicam progresso. Brachiodemon só aparece em Claustrophobic Inferno, área cujo acesso exige Feaster of Souls, mas Bestiary continua sendo um indício histórico fraco."
  },
  "dream-courts": {
    exevoTracked: true,
    complete: { achievements: ["Dream Catcher"] },
    partial: {
      achievements: ["Keeper of the 7 Keys", "Champion of Summer", "Champion of Winter", "Moth Whisperer", "Lacewing Catcher"],
      bosses: ["Izcandar the Banished", "Maxxenius", "Alptramun", "Plagueroot", "Malofur Mangrinder", "The Nightmare Beast"],
      mounts: ["Hibernal Moth", "Lacewing Moth"],
      outfits: ["Dream Warrior"]
    },
    note: "Dream Catcher é o marcador que o Exevo Pan associa a Dream Courts e também pode constar como quest line. O outfit e as outras conquistas registram conclusão/recompensas ou etapas, mas não mudam o critério automático."
  },
  "grave-danger": {
    partial: {
      achievements: ["Avid Spectral Reader", "Inquisition's Hand"],
      outfits: ["Hand of the Inquisition"],
      bosses: ["King Zelos", "Count Vlarkorth", "Lord Azaram", "Earl Osam", "Sir Baeloc", "Sir Nictros", "Duke Krule", "Gaffir", "Custodian", "Guard Captain Quaid", "Scarlett Etzel"]
    },
    note: "Grave Danger não tem token próprio na lista do Exevo Pan; só a quest line oficial promove a concluída. Inquisition's Hand/outfit e as kills provam etapas ou recompensas, não a conclusão por esta regra. Avid Spectral Reader é opcional e não prova a linha."
  },
  "order-falcon": {
    exevoTracked: true,
    complete: { achievements: ["Millennial Falcon"] },
    partial: { bosses: ["Grand Master Oberon"] },
    creatures: ["Falcon Knight", "Falcon Paladin"],
    note: "Millennial Falcon é o marcador de acesso que o Exevo Pan associa à Order of the Falcon. Falcon Knight/Paladin só têm spawn fixo no Falcon Bastion, mas bestiary é indício histórico fraco; a kill de Oberon é evidência de etapa."
  },
  "order-cobra": {
    exevoTracked: true,
    complete: { achievements: ["A Study in Scarlett"] },
    partial: {
      bosses: ["Gaffir", "Custodian", "Guard Captain Quaid", "Scarlett Etzel"]
    },
    note: "A Study in Scarlett é o marcador que o Exevo Pan associa à Order of the Cobra. Avid Spectral Reader foi removido porque é um segredo de Gaffir compartilhado com Grave Danger, não uma prova confiável desta linha."
  },
  "order-lion": {
    exevoTracked: true,
    complete: { achievements: ["Lionheart"] },
    partial: { bosses: ["Drume", "Fugue"] },
    note: "Lionheart exige derrotar Drume e reportar a missão; isso libera título, depot, comerciantes e Ancient Lion Knight."
  },
  "heart-destruction": {
    exevoTracked: true,
    complete: { achievements: ["Heart of Destruction"] },
    partial: {
      achievements: ["Ender of the End"],
      bosses: ["Anomaly", "Rupture", "Realityquake", "Aftershock", "World Devourer", "Eradicator", "Outburst"],
      mounts: ["Sparkion", "Neon Sparkid", "Vortexion"]
    },
    note: "Heart of Destruction é o marcador que o Exevo Pan usa para esta linha. Ender of the End, bosses e mounts ficam como progresso; histórico de loot/kills não prova que uma tentativa futura está disponível."
  },
  "dangerous-depths": {
    exevoTracked: true,
    partial: {
      achievements: ["Buried the Baron", "His Days are Counted", "Duked it Out", "Death in the Depths", "Scourge of Scarabs"],
      bosses: ["The Baron from Below", "The Count Of The Core", "The Duke Of The Depths", "Ancient Spawn of Morgathla"],
      mounts: ["Mole"]
    },
    note: "O Exevo Pan acompanha as Warzones IV, V e VI separadamente por Buried the Baron, His Days are Counted e Duked it Out. Elas marcam cada acesso, não a conclusão da quest inteira; esta só fica concluída automaticamente pela quest line oficial."
  },
  "bigfoots-burden": {
    exevoTracked: true,
    partial: {
      achievements: ["Becoming a Bigfoot", "Gnome Little Helper", "Gnome Friend", "Gnomelike", "Honorary Gnome", "Gnomish Art of War", "Dungeon Cleaner"],
      bosses: ["Deathstrike", "Gnomevil", "Versperoth", "Abyssador"],
      mounts: ["Ironblight", "Magma Crawler"]
    },
    note: "O Exevo Pan rastreia Honorary Gnome como Rank IV e Gnomish Art of War como acesso livre aos bosses. Esses são subacessos, não conclusão da quest. Dungeon Cleaner e bosses indicam progresso; conclusão automática exige quest line."
  },
  "cults-of-tibia": {
    exevoTracked: true,
    complete: { achievements: ["Corruption Contained"] },
    partial: {
      bosses: ["Ravenous Hunger", "The Souldespoiler", "The Unarmored Voidborn", "The Sandking", "The False God", "Essence of Malice", "The Source of Corruption", "The Corruptor Of Souls"]
    },
    note: "As mortes de boss provam acesso às etapas/cultos correspondentes; Corruption Contained é a marca de conclusão da linha."
  },
  "forgotten-knowledge": {
    partial: {
      bosses: ["Lloyd", "Lady Tenebris", "Frozen Horror", "Melting Frozen Horror", "Thorn Knight", "Dragonking Zyrtarch", "The Time Guardian", "The Last Lore Keeper"]
    },
    note: "A página não aponta uma conquista de conclusão exclusiva; o bossiary só confirma que a etapa/boss foi alcançado."
  },
  "new-frontier": {
    partial: { achievements: ["Champion of Chazorai"], outfits: ["Warmaster"] },
    note: "O Exevo Pan usa a linha The New Frontier do Bazaar. Champion of Chazorai e Warmaster são sinais de progresso, mas não substituem a quest line para o status concluído."
  },
  "wrath-emperor": {
    partial: { achievements: ["Godslayer"], outfits: ["Wayfarer"], bosses: ["Mutated Zalamon"] },
    note: "O Exevo Pan usa a linha Wrath of the Emperor do Bazaar. Godslayer, Wayfarer e a kill de Mutated Zalamon são evidências de etapa, mas a conclusão automática exige a quest line."
  },
  "curse-spreads": {
    exevoTracked: true,
    complete: { achievements: ["Over the Moon"] },
    partial: { bosses: ["Black Vixen", "Bloodback", "Darkfang", "Shadowpelt", "Sharpclaw"] },
    note: "Over the Moon requer as duas linhas Curse of the Full Moon e The Curse Spreads."
  },
  "ice-islands": {
    partial: {
      achievements: ["Bearhugger", "Ghostwhisperer"],
      outfits: ["Norseman"]
    },
    note: "Honorary Barbarian pertence à Barbarian Test, uma quest separada e pré-requisito; foi removido como evidência de Ice Islands. Norseman e conquistas associadas podem indicar etapas, enquanto só a quest line marca conclusão."
  },
  "20-years-cook": {
    partial: { outfits: ["Draccoon Herald"], bosses: ["Maliz", "Vengar", "Bruton", "Greedok", "Vilear", "Crultor", "Despor", "Dragon Pack"] },
    creatures: ["Bulltaur Alchemist", "Bulltaur Brute", "Bulltaur Forgepriest", "Dragolisk", "Mega Dragon", "Wardragon"],
    note: "20 Years a Cook não tem token próprio no Exevo Pan; conclusão automática exige quest line. Bulltaurs só têm spawn fixo em Bulltaur Lair e Dragolisk/Mega Dragon/Wardragon em Nimmersatt's Breeding Ground: são pistas históricas fracas de entrada nesses locais."
  },
  "shattered-isles": {
    partial: { achievements: ["Matchmaker"], outfits: ["Pirate"], mounts: ["Undead Cavebear"] },
    note: "O Exevo Pan usa The Shattered Isles do Bazaar. Matchmaker, outfit e mount podem ajudar a identificar etapas, mas só a quest line marca a conclusão automática."
  },
  "postman": {
    partial: { achievements: ["Archpostman"] },
    note: "O Exevo Pan usa The Postman Missions do Bazaar. Archpostman é um forte indício do rank final, mas a quest line oficial é o marcador automático de conclusão."
  },
  "travelling-trader": {
    exevoTracked: true,
    complete: { achievements: ["Recognised Trader"] },
    note: "Recognised Trader é o marcador do Exevo Pan para The Travelling Trader e é recebido ao concluir a linha que libera Rashid."
  },
  "barbarian-test": {
    exevoTracked: true,
    complete: { achievements: ["Honorary Barbarian"] },
    note: "Honorary Barbarian é obtido ao concluir o Barbarian Test e é o token que o Exevo Pan associa a esta quest."
  },
  "explorer-society": {
    partial: { achievements: ["Explorer", "Sea Scout"] },
    note: "Explorer marca a entrega do Spectral Dress; Sea Scout marca duas missões subaquáticas. São evidências de etapa, não do conjunto de ranks/acessos."
  },
  "ape-city": {
    partial: { outfits: ["Shaman"] },
    note: "Shaman Outfit é recompensa da linha e indica progresso; só a quest line oficial confirma a conclusão completa."
  },
  "lions-rock": {
    exevoTracked: true,
    complete: { achievements: ["Lion's Den Explorer"] },
    partial: { mounts: ["Noble Lion"] },
    creatures: ["Roaring Lion"],
    note: "Lion's Den Explorer é concedido por completar Lion's Rock e é o marcador do Exevo Pan. Noble Lion pode ser obtido de outro jogador; Roaring Lion é Bestiary histórico, então esses dois sinais não provam acesso atual."
  },
  "twenty-miles-sea": {
    creatures: ["Seacrest Serpent"],
    note: "Seacrest Serpent fica na área associada à quest, mas Bestiary persiste após rook e não prova acesso atual."
  },
  "hunt-sea-serpent": {
    creatures: ["Sea Serpent"],
    note: "Sea Serpent aparece em outros spawns; Bestiary não identifica a origem da kill e é apenas um indício fraco."
  },
  "liquid-black": {
    partial: { bosses: ["Tanjis", "Obujos", "Jaul"], outfits: ["Deepling"] },
    creatures: ["Deepling Guardian"],
    note: "Bosses e outfit indicam avanço passado; Deepling Guardian é pista histórica de uma área profunda. Nenhum deles garante uma tentativa atual."
  },
  "grimvale": {
    exevoTracked: true,
    partial: { achievements: ["Drama in Darama", "Over the Moon"], bosses: ["Owin", "Feroxa", "Katex Blood Tongue", "Srezz Yellow Eyes", "Utua Stone Sting", "Yirkas Blue Scales", "Ayana the Crimson Curse", "Tamru the Black"] },
    note: "O Exevo Pan acompanha os ramos por tokens separados: Drama in Darama comprova An Ancient Feud, e Over the Moon requer The Curse of the Full Moon e The Curse Spreads. Nenhum deles conclui Grimvale inteira; kills são históricas."
  },
  "rathleton-citizenship": {
    exevoTracked: true,
    complete: { achievements: ["Rathleton Citizen"] },
    note: "Rathleton Citizen é o token do Exevo Pan e indica que o personagem alcançou a cidadania/rank correspondente; pontuação maior e outros acessos de Oramond podem exigir progresso adicional."
  },
  "blood-brothers": {
    partial: { outfits: ["Yalaharian"] },
    note: "Yalaharian Outfit é evidência de progresso associado; acesso a Vengoth e requisito da missão 4 precisam ser conferidos separadamente."
  },
  "children-revolution": {
    partial: { outfits: ["Warmaster"] },
    note: "O addon Warmaster aparece durante esta linha. Outfit não substitui a quest line oficial para conclusão."
  },
  "dark-trails": {
    partial: { outfits: ["Glooth Engineer"] },
    note: "Glooth Engineer é recompensa associada e só indica progresso; a entrada na Fury Dungeon precisa ser conferida."
  },
  "too-hot-handle": {
    partial: { achievements: ["Some Like It Hot"], bosses: ["The Mega Magmaoid", "The Brainstealer"] },
    note: "Some Like It Hot é um achievement associado à quest e os bosses mostram avanço. Como o Exevo Pan não usa esse achievement como token, só a linha oficial marca conclusão."
  },
  "within-tides": {
    partial: { achievements: ["Wedding Planner"], bosses: ["Timira the Many-Headed"], mounts: ["Giant Beaver"] },
    note: "Wedding Planner e Timira apoiam a leitura de progresso. Giant Beaver pode vir de outro jogador; nenhum desses sinais fecha automaticamente a linha."
  },
  "lost-brother": {
    partial: { achievements: ["Lost Palace Raider"] },
    note: "Lost Palace Raider exige The Lost Brother e Asura Palace completos. O token é mapeado pelo Exevo Pan para Asura Palace; neste card ele é evidência cruzada de progresso, e a conclusão automática continua dependendo da quest line de The Lost Brother."
  },
  "between-lines": {
    partial: {
      bosses: ["Inkwing", "Sir Leonard", "Tropical Desolator", "Blight Mariner", "Wrathful Archivist"],
      outfits: ["Illuminator"]
    },
    note: "Outfit e mortes dos cinco bosses identificam recompensas/etapas, mas não indicam se todas as hunts ou tentativas atuais estão liberadas."
  },
  "order-stag": {
    partial: { bosses: ["Court Warlock"] },
    note: "A morte de Court Warlock é evidência de etapa histórica. A conclusão automática usa apenas a quest line publicada pelo Bazaar."
  },
  "secret-service": {
    partial: { achievements: ["Secret Agent", "Top AVIN Agent", "Top CGB Agent", "Top TBI Agent"] },
    note: "Os achievements confirmam que a missão de espionagem e a agência foram escolhidas; o pacote/item selecionado não aparece no Bazaar."
  },
  "inquisition": {
    partial: { outfits: ["Demon Hunter"] },
    note: "Demon Hunter Outfit sinaliza progresso/recompensa da linha; a quest line continua sendo o único marcador automático de conclusão fora dos tokens do Exevo Pan."
  },
  "way-of-monk": {
    partial: { achievements: ["Hope of the Merudri"] },
    note: "Hope of the Merudri é recebido ao tocar os dez santuários; fica como progresso até a linha oficial ser listada."
  },
  "hero-rathleton": {
    partial: { bosses: ["Deep Terror", "Professor Maxxen"] },
    note: "Bosses confirmam batalhas anteriores, mas o Bazaar não informa se a dungeon continua liberada agora."
  },
  "asura-palace": {
    exevoTracked: true,
    complete: { achievements: ["Lost Palace Raider"] },
    partial: { bosses: ["The Moonlight Aster", "The Winter Bloom", "The Flaming Orchid"] },
    creatures: ["Midnight Asura", "Frost Flower Asura", "Dawnfire Asura"],
    note: "Lost Palace Raider é o token do Exevo Pan: comprova The Lost Brother e o encontro com The Flaming Orchid, liberando o acesso associado. As outras kills são históricas; Bestiary pode anteceder um rook."
  },
  "kilmaresh": {
    exevoTracked: true,
    complete: { achievements: ["Sun and Sea"] },
    partial: {
      bosses: ["Mozradek", "Xogixath", "Bragrumol", "Enusat the Onyx Wing", "Neferi the Spy", "Amenef the Burning", "Sister Hetai", "Urmahlullu the Immaculate"],
      outfits: ["Citizen of Issavi"]
    },
    note: "Sun and Sea é o token do Exevo Pan e exige as quatro missões principais de Kilmaresh. Outfit e bosses identificam progresso; atalhos e prontidão para uma nova tentativa ainda devem ser confirmados no jogo."
  },
  "ferumbras-ascendant": {
    partial: {
      bosses: ["Tarbaz", "Shulgrax", "Plagirath", "Zamulosh", "Mazoran", "Razzagorn", "Ragiaz", "Ferumbras Soul Splinter", "Ascending Ferumbras", "Ferumbras Mortal Shell"],
      outfits: ["Rift Warrior"]
    },
    note: "Rift Warrior e boss kills apontam para etapas/recompensas; a linha oficial é necessária para declarar conclusão automática."
  },
  "adventures-galthen": {
    partial: { bosses: ["Megasylvan Yselda", "Ahau", "Atab", "Mitmah Vanguard"] },
    note: "As mortes são sinais históricos de acesso às batalhas. A linha ainda pode receber novas missões no futuro."
  },
  "cradle-monsters": {
    partial: { bosses: ["Doctor Marrow", "The Monster"] },
    creatures: ["Mutated Abomination"],
    note: "Kills de boss são evidência parcial; Mutated Abomination é apenas indício de Bestiary e não confirma acesso após rook."
  },
  "roost-graveborn": {
    partial: { bosses: ["Bone Overlord"] },
    note: "A morte registrada mostra que o boss foi alcançado anteriormente; não é confirmação de disponibilidade futura."
  },
  "curse-full-moon": {
    exevoTracked: true,
    complete: { achievements: ["Over the Moon"] },
    partial: { bosses: ["Feroxa", "Owin"] },
    note: "Over the Moon exige concluir Curse of the Full Moon e The Curse Spreads; por isso é marcador de conclusão para este ramo e para The Curse Spreads, mas não conclui Grimvale inteira. Feroxa/Owin são kills históricas."
  },
  "ancient-feud": {
    exevoTracked: true,
    complete: { achievements: ["Drama in Darama"] },
    partial: { bosses: ["Katex Blood Tongue", "Srezz Yellow Eyes", "Utua Stone Sting", "Yirkas Blue Scales"] },
    note: "Drama in Darama é a conquista do ramo An Ancient Feud e o token usado pelo Exevo Pan; não conclui os outros ramos de Grimvale. Os registros dos quatro bosses são históricos."
  },
  "paradise-lost": {
    partial: { bosses: ["Ayana the Crimson Curse", "Tamru the Black"] },
    note: "Essas mortes indicam uma batalha histórica do ramo Paradise Lost; acesso atual a Oskayaat ainda depende dos pré-requisitos."
  },
  "the-lament": {
    partial: { bosses: ["The Diamond Blossom", "The Blazing Rose"] },
    note: "As mortes mostram que os bosses das Asura Vaults foram enfrentados, mas podem anteceder um rook; conclusão automática exige a linha The Lament no Bazaar."
  },
  "bloody-tusks": {
    partial: { achievements: ["Bat Person"], bosses: ["Vladrukh"], mounts: ["Gloom Maw"] },
    note: "Bat Person é concedido ao concluir Bloody Tusks e é evidência específica de avanço/conclusão. Como não é um token de conclusão do Exevo Pan, este card só promove automaticamente pela quest line do Bazaar; Vladrukh é kill histórica e Gloom Maw é indício fraco de mount."
  },
  "podzilla": {
    partial: { bosses: ["The Rootkraken"], outfits: ["Rootwalker"] },
    note: "O Rootwalker Outfit e The Rootkraken identificam progresso/recompensas; como o Exevo Pan não usa um token de conclusão para esta quest, só a quest line oficial marca conclusão automática."
  },
  "liquid-death": {
    partial: { bosses: ["Brokul"] },
    note: "Liquid Death é uma missão da The Secret Library, não se infere como concluída pela quest line pai. Brokul registra uma batalha passada e fica como evidência parcial/histórica."
  }
};
