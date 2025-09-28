const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');
const Tweakpane = require('tweakpane');

const body = document.getElementsByTagName("body");
body[0].style.backgroundColor = "#28292e";
body[0].style.overflow = "hidden";

const style = document.createElement('style');
style.textContent = `
  input[type="file"]::file-selector-button {
    border: none;
    height: 20px;
    color: #adafb8;
    padding: 0.2em 0.4em;
    border-radius: 0.2em;
    background-color: #28292e;
    font-family: "Roboto Mono, Source Code Pro, Menlo, Courier, monospace";
  }

  input[type="file"]::file-selector-button:hover {
    background-color: rgba(187, 188, 196, 0.15);
  }

  .normal-button {
    float: right;
    background: #28292e;
    border: none;
    color: #bbbcc4;
    margin-top: 6px;
    font-family: "Roboto Mono, Source Code Pro, Menlo, Courier, monospace";
  }

  .normal-button:hover {
    background-color: rgba(187, 188, 196, 0.15);
  }
`;
document.head.appendChild(style);

// --agrega el favicon a la pagina--
const favicon = document.createElement('link');
favicon.rel = 'icon';
favicon.href = 'PixifyIcon.png';
document.head.appendChild(favicon);

// --pestaña con la vista del archivo cargado--
// crea el input que permite cargar la imagen
const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.accept = 'image/*';
fileInput.style.height = '20px';
fileInput.style.background = "transparent";
fileInput.style.color = "#bbbcc4";

// crea el elemento img que mostrara la imagen cargada
const fileImg = document.createElement('img');
fileImg.src = "banana.jpg";
fileImg.style.width = '275px';
fileImg.style.height = 'auto';
fileImg.style.background = '#28292e';
fileImg.style.borderRadius = '0 0 6px 0';

// crea la pestaña (elemento padre)
const fileContainer = document.createElement('div');
fileContainer.style.display = 'flex';
fileContainer.style.flexDirection = 'column';
fileContainer.style.alignItems = 'center';
fileContainer.style.background = '#37383d';
fileContainer.style.borderRadius = '6px';
fileContainer.style.margin = '0px';
fileContainer.style.position = 'absolute';
fileContainer.style.top = '8px';
fileContainer.style.left = '8px';
fileInput.style.fontFamily = "Roboto Mono, Source Code Pro, Menlo, Courier, monospace";
fileContainer.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.2)";

// encabezado de la pestaña
const header = document.createElement('div');
header.style.display = "flex";
header.style.alignItems = "center";
header.style.justifyContent = "left";
header.style.height = "24px";
header.style.paddingLeft = "6px";
header.appendChild(fileInput);

// crea una barra vertical
const bar = document.createElement("div");
bar.style.height = "auto";
bar.style.width = "6px";
bar.style.background = "#37383d";
bar.style.borderRadius = '0 0 0 6px';

// crea el contenido de la pestaña y agrega los elementos correspondientes
const content = document.createElement('div');
content.style.background = "#28292e";
content.style.borderRadius = '6px';
content.style.display = "flex";
content.style.flexDirection = "row";
content.appendChild(bar);
content.appendChild(fileImg);

// agrega el encabezado y el contenido a la pestaña
fileContainer.appendChild(header);
fileContainer.appendChild(content);

document.body.appendChild(fileContainer);

// objeto que guardara las configuraciones y parametros del panel
const params = { 
  cols: 20,
  rows: 20,
  cellSize: 13,
  grayScale: false,
  cellType: 'NormalPixel',
  character: '',

  img: "banana.jpg"
};

const settings = {
  dimensions: [params.cols * params.cellSize, params.rows * params.cellSize],
  scaleToView: false, // mejor false para que el tamaño sea fijo y exacto
  scaleToFit: false,
  animate: false,
  hotkeys: false // desactiva atajos
};

let manager;

let fontFamily = 'serif';

const typeCanvas = document.createElement('canvas');
const typeContext = typeCanvas.getContext('2d');

const sketch = ({ context, width, height }) => {
  return ({ context, width, height }) => {
    // se definen las propiedades del typeCanvas antes de la funcion de render porque no queremos que se repita, solo lo hacemos una vez
    const cell = params.cellSize;
    // por cada 20 pixeles en nuestro canvas principal, tendremos un pixel en nuestro typeCanvas
    const cols = params.cols;
    const rows = params.rows;
    const numCells = cols * rows;
    
    const typeData = typeContext.getImageData(0, 0, cols, rows).data;
    console.log(typeData);
    
    context.fillStyle = '#000'; // negro o el color que quieras
    context.fillRect(0, 0, width, height);

    context.textBaseline = 'middle';
    context.textAlign = 'center';

    for (let i = 0; i < numCells; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);

      const x = col * cell;
      const y = row * cell;

      const r = typeData[i * 4 + 0]; // buscamos el primer canal del pixel en el que estamos * 4 porque son 4 canales
      const g = typeData[i * 4 + 1];
      const b = typeData[i * 4 + 2];
      const a = typeData[i * 4 + 3];

      const brightness = (r + g + b) / 3; //luminosidad
      const glyph = getGlyph(brightness);

      context.font = `${cell * 2}px ${fontFamily}`;
      //if (Math.random() < 0.1) context.font = `${cell * 6}px ${fontFamily}`; // 10 porciento de que la fuente sea mas grande

      /*if (col < 3 && row < 3) {
        context.fillStyle = `transparent`;
      } else {
        context.fillStyle = `rgb(${r}, ${g}, ${b})`;
      }*/
      if (params.grayScale) {
        // formula NTSC
        grayValue = 0.299 * r + 0.587 * g + 0.114 * b;
        context.fillStyle = `rgb(${grayValue}, ${grayValue}, ${grayValue})`;
      } else {
        context.fillStyle = `rgb(${r}, ${g}, ${b})`;
      }

      context.save();
      context.translate(x, y);
      //context.translate(cell * 0.5, cell * 0.5); mueve el dibujo media celda a la derecha y abajo

      if (params.cellType == "NormalPixel") {
        context.fillRect(0, 0, cell, cell);
      } else {
        context.fillText(params.character, cell/2, cell/2);
      }

      context.restore();
    }
    //context.drawImage(typeCanvas, 0, 0); //dibuja la imagen de la letra en la esquina superior izquierda (0,0)
  };
};

const getGlyph = (v) => {
  // v sera un valor entero entre 0 y 255
  if (v < 50) return 'o';
  if (v < 100) return 'g';
  if (v < 150) return 'p';
  if (v < 200) return 'u';

  const glyphs = '0'.split(''); 

  // random.pick devuelve un elemento aleatorio de una matriz
  return random.pick(glyphs);
};

const start = async () => {
  await restartSketch();
}


const loadAndDrawImage = () => {
  // actualizar tamaño del canvas pequeño según cols y rows
  typeCanvas.width = params.cols;
  typeCanvas.height = params.rows;

  const image = new Image();
  image.src = params.img; // reemplazá por tu imagen

  image.onload = () => {
    // dibuja la imagen escalada al tamaño de cols x rows
    typeContext.clearRect(0, 0, typeCanvas.width, typeCanvas.height);
    typeContext.drawImage(image, 0, 0, params.cols, params.rows);
    if (manager) manager.render(); // redibuja el canvas principal
  };
};

async function restartSketch() {
  // eliminar el canvas anterior (si hay uno)
  const oldCanvas = document.querySelector('canvas');
  if (oldCanvas && oldCanvas.parentNode) {
    oldCanvas.parentNode.removeChild(oldCanvas);
  }

  // actualizar dimensiones según parámetros actuales
  settings.dimensions = [params.cols * params.cellSize, params.rows * params.cellSize];

  // recargar la imagen
  loadAndDrawImage();

  // volver a crear el canvas y manager
  manager = await canvasSketch(sketch, settings);
}

function CreateALert(text) {
  const container = document.createElement("div");
  container.style.maxWidth = "400px";
  container.style.background = "#37383d";
  container.style.borderRadius = "6px";
  container.style.position = "absolute";
  container.style.left = "50%";
  container.style.top = "8px";
  container.style.transform = "translateX(-50%)";

  const textBlock = document.createElement("p");
  textBlock.textContent = text;
  textBlock.style.fontFamily = "Roboto Mono, Source Code Pro, Menlo, Courier, monospace";
  textBlock.style.color = "#bbbcc4";
  textBlock.style.textAlign = "center";
  textBlock.style.margin = "0";

  const closeButton = document.createElement("button");
  closeButton.textContent = "cerrar";
  closeButton.classList.add("normal-button");

  closeButton.addEventListener('click', function () {
    this.parentNode.remove(); // usa `function` para que `this` sea el botón
  });

  container.appendChild(textBlock);
  container.appendChild(closeButton);
  container.style.padding = "6px";
  container.style.fontSize = "11px";

  document.body.appendChild(container);
}

const createPane = () => { // funcion del panel
  const pane = new Tweakpane.Pane();
  let folder1;
  let folder2;

  folder1 = pane.addFolder({ title: 'Options' }); // crea una carpeta con las configuraciones del panel

  folder1.addInput(params, 'cols', { min: 2, max: 350, step: 1 }).on("change", async () => {
      loadAndDrawImage();
      await restartSketch();
    });
  folder1.addInput(params, 'rows', { min: 2, max: 350, step: 1 }).on("change", async () => {
      loadAndDrawImage();
      await restartSketch();
    });;

  folder1.addInput(params, 'cellSize', { min: 2, max: 50, step: 1 }).on("change", async () => {
      loadAndDrawImage();
      await restartSketch();
    });
  folder1.addInput(params, 'grayScale').on("change", async () => {
      loadAndDrawImage();
      await restartSketch();
    });

  folder2 = pane.addFolder({ title: 'CellsOptions' });

  // input select
  const cellTypeInput = folder2.addInput(params, 'cellType', {
    options: {
      NormalPixel: 'NormalPixel',
      Character: 'Character',
    },
  });

  let letterInput = null; // referencia al input dinámico

  // detectar cambios
  cellTypeInput.on('change', async (ev) => {
    if (ev.value === 'Character') {
      // si no existe, crearlo
      if (!letterInput) {
        letterInput = folder2.addInput(params, 'character', {
          label: 'Caracter',
        });

        setTimeout(() => {
          if (params.character != "") {
          } else {
            CreateALert("Ingresa un caracter para renderizar la imagen");
          }
        }, 4000);

        letterInput.on('change', async () => {
          loadAndDrawImage();
          await restartSketch();
        });
      }
    } else {
      // si cambiaron a otra opción, eliminar el input si existe
      if (letterInput) {
        folder2.remove(letterInput);
        letterInput = null;
      }
    }
    loadAndDrawImage();
    await restartSketch();
  });
};

// esto hace que se actualice la imagen cuando elegís un archivo
fileInput.addEventListener('change', async function () {
  const file = fileInput.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = async function (e) {
    const imageDataUrl = e.target.result;

    fileImg.src = imageDataUrl;     // mostrar imagen cargada en UI
    params.img = imageDataUrl;      // guardar imagen para uso en typeCanvas

    loadAndDrawImage();             // dibujar en typeCanvas
    await restartSketch();          // renderizar canvas principal
  };

  reader.readAsDataURL(file);
});

createPane(); //crea el panel

restartSketch();