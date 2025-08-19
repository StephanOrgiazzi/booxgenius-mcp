import * as fs from 'fs/promises';
import * as path from 'path';
import * as BooxGenius from './booxgenius';
import { Character, ChapterOutline, SceneMetadata } from './types';

const bookProjectDir = 'mon-livre-de-test';

async function setupDirectoryStructure() {
    console.log(`Création du projet de livre : ${bookProjectDir}`);
    await fs.mkdir(path.join(process.cwd(), bookProjectDir, 'characters'), { recursive: true });
    await fs.mkdir(path.join(process.cwd(), bookProjectDir, 'outline'), { recursive: true });
    await fs.mkdir(path.join(process.cwd(), bookProjectDir, 'scenes'), { recursive: true });
    await fs.mkdir(path.join(process.cwd(), bookProjectDir, 'chapters'), { recursive: true });
    await fs.mkdir(path.join(process.cwd(), bookProjectDir, 'output'), { recursive: true });
    console.log('Structure des répertoires créée.');
}

async function main() {
    await setupDirectoryStructure();

    // 1. Écrire le draft initial
    console.log('\n1. Écriture du draft...');
    const draftContent = `# Mon Super Livre\n\nSynopsis: Une aventure épique pour trouver un artefact ancien.`;
    await BooxGenius.write_draft(bookProjectDir, draftContent);
    console.log('Draft enregistré.');

    // 2. Créer les personnages
    console.log('\n2. Création des personnages...');
    const marie: Character = {
        name: "Marie Dubois",
        role: "protagoniste",
        age: 28,
        background: "Archéologue parisienne",
        personality: ["curieuse", "déterminée", "impulsive"],
        relationships: { mentor: "Professeur Laurent" },
        arc: { start: "naive and trusting", end: "experienced and wary" }
    };
    const laurent: Character = {
        name: "Professeur Laurent",
        role: "secondaire",
        age: 55,
        background: "Historien et mentor de Marie",
        personality: ["sage", "prudent"]
    };
    await BooxGenius.write_character(bookProjectDir, marie);
    await BooxGenius.write_character(bookProjectDir, laurent);
    console.log('Personnages enregistrés.');

    // 3. Définir le plan des chapitres
    console.log('\n3. Définition du plan...');
    const chapterOutlines: ChapterOutline[] = [
        {
            chapter_number: 1,
            title: "Début de l’aventure",
            summary: "Marie découvre un mystère ancien...",
            key_events: ["découverte du manuscrit", "première rencontre"],
            characters_involved: ["Marie Dubois", "Professeur Laurent"],
            target_scenes: 2
        }
    ];
    await BooxGenius.write_chapter_outline(bookProjectDir, chapterOutlines);
    console.log('Plan enregistré.');

    // 4. Écrire les scènes
    console.log('\n4. Écriture des scènes...');
    const scene1_1: SceneMetadata = { chapter: 1, scene: 1, characters: ["Marie Dubois"], location: "Bibliothèque", mood: "mystérieux" };
    const prose1_1 = "Marie parcourait les archives poussiéreuses quand soudain...";
    await BooxGenius.write_scene(bookProjectDir, scene1_1, prose1_1);

    const scene1_2: SceneMetadata = { chapter: 1, scene: 2, characters: ["Marie Dubois", "Professeur Laurent"], location: "Bureau du professeur", mood: "révélation" };
    const prose1_2 = "Le professeur Laurent examina le manuscrit avec attention.";
    await BooxGenius.write_scene(bookProjectDir, scene1_2, prose1_2);
    console.log('Scènes enregistrées.');

    // 5. Assembler le chapitre
    console.log('\n5. Assemblage du chapitre 1...');
    await BooxGenius.assemble_chapter_prose(bookProjectDir, 1);
    console.log('Chapitre 1 assemblé.');
    const chapter1Prose = await BooxGenius.read_chapter_prose(bookProjectDir, 1);
    console.log('--- Contenu du Chapitre 1 ---\n', chapter1Prose);

    // 6. Synchroniser les personnages
    console.log('\n6. Synchronisation des personnages...');
    const newCharacters = await BooxGenius.sync_characters_from_scenes(bookProjectDir);
    if (newCharacters.length > 0) {
        console.log(`Nouveaux personnages créés automatiquement : ${newCharacters.join(', ')}`);
    } else {
        console.log('Aucun nouveau personnage récurrent trouvé. La base est cohérente.');
    }

    console.log('\n\n🚀 Démonstration terminée ! Le projet de livre se trouve dans le dossier \'mon-livre-de-test\'.');
}

main().catch(console.error);