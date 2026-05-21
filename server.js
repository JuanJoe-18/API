const express = require("express");
const cors = require("cors");
const app = express();
const port = 5000;


app.use(express.json());
app.use(cors());
app.use(express.static("public"));




// Requisito 1: POST para generar un crucigrama de tamaño variable
app.post("/api/crossword/generate", (req, res) => {
    const { size } = req.body; // Aquí recibirás el tamaño que envíe el usuario (ej: 10x10, 15x15)

    // TODO: Tu lógica para inicializar o crear la matriz del crucigrama

    res.status(201).json({
        message: `Crucigrama de tamaño ${size} generado exitosamente (Pendiente lógica)`
    });
});

// Requisito 2: GET para entregar la estructura actual del crucigrama al Frontend
app.get("/api/crossword/layout", (req, res) => {
    // TODO: Tu lógica para retornar la matriz de celdas, las posiciones de los números y las pistas

    //Ejemplo de estructura minima a retornar
    const mockLayout = {
        gridSize: 10,
        clues: {
            across: ["1. Framework backend popular", "2. Formato de intercambio de datos"],
            down: ["1. El motor de base de datos relacional"]
        },
        matrix: [] // Tu mapa o array de celdas activas/bloqueadas
    };

    res.status(200).json(mockLayout);
});

// Requisito 3: POST para recibir y validar la palabra que ponga el usuario
app.post("/api/crossword/validate", (req, res) => {
    const { word, direction, row, col } = req.body; // El frontend te enviará estos datos al terminar una palabra

    // TODO: Tu lógica para verificar si en esa posición la palabra es correcta o incorrecta

    res.status(200).json({
        correct: true,
        message: "Validación procesada"
    });
});


app.listen(port, () => {
    console.log(`Servidor base listo y corriendo en http://localhost:${port}`);
});


// Base local de palabras españolas comunes para crucigramas
const palabrasLocalES = [
    { palabra: "sol", pista: "Estrella que ilumina la Tierra durante el día" },
    { palabra: "luna", pista: "Satélite natural que orbita la Tierra" },
    { palabra: "rio", pista: "Corriente de agua que fluye hacia el mar" },
    { palabra: "árbol", pista: "Planta leñosa de gran tamaño con ramas y hojas" },
    { palabra: "piedra", pista: "Material duro y sólido que forma las rocas" },
    { palabra: "fuego", pista: "Fenómeno de combustión con llama y calor" },
    { palabra: "tierra", pista: "Planeta donde vivimos; suelo fértil" },
    { palabra: "mar", pista: "Extensa masa de agua salada" },
    { palabra: "montaña", pista: "Elevación natural del terreno" },
    { palabra: "viento", pista: "Movimiento del aire atmosférico" },
    { palabra: "nube", pista: "Masa de vapor de agua en la atmósfera" },
    { palabra: "lluvia", pista: "Precipitación de agua desde las nubes" },
    { palabra: "nieve", pista: "Agua congelada que cae en forma de copos" },
    { palabra: "casa", pista: "Edificio donde habita una familia" },
    { palabra: "puerta", pista: "Acceso o entrada a una habitación" },
    { palabra: "ventana", pista: "Abertura en la pared que deja pasar luz" },
    { palabra: "mesa", pista: "Mueble con superficie plana para comer o trabajar" },
    { palabra: "silla", pista: "Mueble con respaldo para sentarse" },
    { palabra: "libro", pista: "Conjunto de hojas encuadernadas con texto" },
    { palabra: "gato", pista: "Felino doméstico pequeño y ágil" },
    { palabra: "perro", pista: "Canino doméstico, fiel compañero del hombre" },
    { palabra: "agua", pista: "Líquido esencial incoloro e inodoro" },
    { palabra: "corazón", pista: "Órgano que bombea sangre en el cuerpo" },
    { palabra: "cabeza", pista: "Parte superior del cuerpo humano donde está el cerebro" },
    { palabra: "mano", pista: "Extremidad al final del brazo con dedos" },
    { palabra: "código", pista: "Conjunto de instrucciones para una computadora" },
    { palabra: "redes", pista: "Sistemas conectados para compartir información" },
    { palabra: "datos", pista: "Información concreta sobre hechos" }
];

async function obtenerPalabrasValidas(longitudDeseada, cantidad) {
    try {
        // Primero, intentamos con palabras locales (garantizado)
        const palabrasFiltradasLocal = palabrasLocalES
            .filter(p => p.palabra.length === longitudDeseada)
            .slice(0, cantidad);

        // Si tenemos suficientes locales, devolvemos eso
        if (palabrasFiltradasLocal.length >= cantidad) {
            console.log(`✅ Se encontraron ${palabrasFiltradasLocal.length} palabras en la base local`);
            return palabrasFiltradasLocal;
        }

        // Si no, intentamos completar con Wiktionary
        console.log(`📚 Buscando ${cantidad - palabrasFiltradasLocal.length} palabras adicionales en Wiktionary...`);
        
        const palabrasWiktionary = await buscarEnWiktionary(longitudDeseada, cantidad - palabrasFiltradasLocal.length);
        
        return [...palabrasFiltradasLocal, ...palabrasWiktionary];

    } catch (error) {
        console.error("❌ Error en obtenerPalabrasValidas:", error.message);
        // Fallback: cualquier palabra local que tengamos
        return palabrasLocalES.slice(0, cantidad);
    }
}

async function buscarEnWiktionary(longitud, cantidad) {
    // Lista de palabras españolas comunes para probar en Wiktionary
    const palabrasParaPrueba = [
        "sol", "luna", "río", "árbol", "piedra", "fuego", "tierra", 
        "mar", "montaña", "viento", "nube", "lluvia", "nieve",
        "casa", "puerta", "ventana", "mesa", "silla", "libro",
        "gato", "perro", "agua", "corazón", "cabeza", "mano"
    ];

    const resultados = [];

    for (const palabra of palabrasParaPrueba) {
        if (resultados.length >= cantidad) break;

        try {
            const url = `https://en.wiktionary.org/w/api.php?action=query&titles=${palabra}&prop=extracts&explaintext=true&format=json&utf8=true`;
            
            const res = await fetch(url);
            const data = await res.json();

            // Parsear la respuesta de Wiktionary
            const pages = data.query?.pages;
            if (pages) {
                const pageKey = Object.keys(pages)[0];
                const extract = pages[pageKey]?.extract;

                if (extract && extract.length > 0) {
                    // Tomar solo las primeras 120 caracteres como pista
                    const pista = extract.substring(0, 120).trim() + "...";
                    
                    if (palabra.length === longitud) {
                        resultados.push({
                            palabra: palabra.toUpperCase(),
                            pista: pista
                        });
                        console.log(`✨ Palabra obtenida de Wiktionary: ${palabra.toUpperCase()}`);
                    }
                }
            }
        } catch (err) {
            console.warn(`⚠️  Error consultando Wiktionary para "${palabra}":`, err.message);
        }
    }

    return resultados;
}

// Endpoint temporal de diagnóstico en tu servidor
app.get("/api/test-words", async (req, res) => {
    const resultado = await obtenerPalabrasValidas(5, 3);
    res.json(resultado);
});

