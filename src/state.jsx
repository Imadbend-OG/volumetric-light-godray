const state = {
  top: 0,
  pages: 0,
  threshold: 4,
  mouse: [0, 0],
  content: [
    {
      tag: '00',
      text: `Un Futur énergétique\nincertain et complexe`,
      images: ['/images/chatn.png', '/images/chate.png', '/images/chatp.png'],
    },
    { tag: '01', text: `E-Optima:\nIntelligence au service\nde l'énergie`, images: ['/images/cha.png', '/images/chb.png', '/images/chc.png'] },
    { tag: '02', text: `Comment \nça marche?`, images: ['/images/coa.png', '/images/cob.png', '/images/coc.png'] },
  ],
  depthbox: [
    {
      depth: 0,
      color: '#cccccc',
      textColor: '#ffffff',
      text: 'Là où,\n l’IA rencontre\n  l’énergie,\n l’efficacité devient\n  réalité.',
      image: '/images/cAKwexj.jpg',
    },
    {
      depth: -5,
      textColor: '#272727',
      text: 'Dans un monde où l’énergie devient une ressource critique,\ncomprendre ne suffit plus.\nIl faut anticiper,\nmodéliser et décider\nintelligemment.Notre approche transforme les données en vision,et la vision en actions concrètes pour un avenir énergétique durable',
      image: '/images/04zTfWB.jpg',
    },
  ],
  lines: [
    { points: [[-20, 0, 0], [-9, 0, 0]], color: "black", lineWidth: 0.5 },
    { points: [[20, 0, 0], [9, 0, 0]], color: "black", lineWidth: 0.5 },
  ]
}

export default state
