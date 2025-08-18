import * as fs from 'fs/promises';
import * as path from 'path';
import matter from 'gray-matter';
import { Character, ChapterOutline, SceneMetadata } from './types';

const projectRoot = process.cwd();

// --- Draft Management ---
export async function write_draft(bookDir: string, content: string): Promise<void> {
    const draftPath = path.join(projectRoot, bookDir, 'draft.md');
    await fs.writeFile(draftPath, content, 'utf-8');
}

export async function read_draft(bookDir: string): Promise<string> {
    const draftPath = path.join(projectRoot, bookDir, 'draft.md');
    return fs.readFile(draftPath, 'utf-8');
}

// --- Character Management ---
export async function write_character(bookDir: string, character: Character): Promise<void> {
    const charDir = path.join(projectRoot, bookDir, 'characters');
    await fs.mkdir(charDir, { recursive: true });
    const filePath = path.join(charDir, `${character.name.toLowerCase().replace(/\s+/g, '-')}.json`);
    await fs.writeFile(filePath, JSON.stringify(character, null, 2), 'utf-8');
}

export async function read_characters(bookDir: string, name?: string): Promise<Character | Character[]> {
    const charDir = path.join(projectRoot, bookDir, 'characters');
    if (name) {
        const filePath = path.join(charDir, `${name.toLowerCase().replace(/\s+/g, '-')}.json`);
        const content = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(content) as Character;
    }
    const files = await fs.readdir(charDir);
    const characters: Character[] = [];
    for (const file of files) {
        if (file.endsWith('.json')) {
            const content = await fs.readFile(path.join(charDir, file), 'utf-8');
            characters.push(JSON.parse(content));
        }
    }
    return characters;
}

// --- Chapter Outline Management ---
export async function write_chapter_outline(bookDir: string, outlines: ChapterOutline[]): Promise<void> {
    const outlineDir = path.join(projectRoot, bookDir, 'outline');
    await fs.mkdir(outlineDir, { recursive: true });
    const filePath = path.join(outlineDir, 'chapters-outline.json');
    await fs.writeFile(filePath, JSON.stringify(outlines, null, 2), 'utf-8');
}

export async function read_chapter_outline(bookDir: string): Promise<ChapterOutline[]> {
    const filePath = path.join(projectRoot, bookDir, 'outline', 'chapters-outline.json');
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content) as ChapterOutline[];
}

// --- Scene Management ---
export async function write_scene(bookDir: string, metadata: SceneMetadata, prose: string): Promise<void> {
    const scenesDir = path.join(projectRoot, bookDir, 'scenes');
    await fs.mkdir(scenesDir, { recursive: true });
    const sceneContent = matter.stringify(prose, metadata);
    const fileName = `ch${String(metadata.chapter).padStart(2, '0')}-scene${String(metadata.scene).padStart(2, '0')}.md`;
    const filePath = path.join(scenesDir, fileName);
    await fs.writeFile(filePath, sceneContent, 'utf-8');
}

export async function read_scenes(bookDir: string, chapter: number, scene?: number): Promise<string | string[]> {
    const scenesDir = path.join(projectRoot, bookDir, 'scenes');
    if (scene) {
        const fileName = `ch${String(chapter).padStart(2, '0')}-scene${String(scene).padStart(2, '0')}.md`;
        return fs.readFile(path.join(scenesDir, fileName), 'utf-8');
    }
    const files = await fs.readdir(scenesDir);
    const chapterScenes = files.filter(f => f.startsWith(`ch${String(chapter).padStart(2, '0')}-`));
    const sceneContents: string[] = [];
    for (const file of chapterScenes) {
        sceneContents.push(await fs.readFile(path.join(scenesDir, file), 'utf-8'));
    }
    return sceneContents;
}

// --- Chapter Prose Generation ---
export async function assemble_chapter_prose(bookDir: string, chapter: number): Promise<void> {
    const scenes = await read_scenes(bookDir, chapter) as string[];
    let fullProse = ``;
    for (const sceneContent of scenes.sort()) {
        const { content } = matter(sceneContent);
        fullProse += content + '\n\n';
    }
    const chaptersDir = path.join(projectRoot, bookDir, 'chapters');
    await fs.mkdir(chaptersDir, { recursive: true });
    const filePath = path.join(chaptersDir, `chapter-${String(chapter).padStart(2, '0')}.md`);
    await fs.writeFile(filePath, fullProse.trim(), 'utf-8');
}

export async function read_chapter_prose(bookDir: string, chapter: number): Promise<string> {
    const filePath = path.join(projectRoot, bookDir, 'chapters', `chapter-${String(chapter).padStart(2, '0')}.md`);
    return fs.readFile(filePath, 'utf-8');
}

// --- Sync Management ---
export async function sync_characters_from_scenes(bookDir: string, minMentions = 2): Promise<string[]> {
    const scenesDir = path.join(projectRoot, bookDir, 'scenes');
    const charactersDir = path.join(projectRoot, bookDir, 'characters');
    const sceneFiles = await fs.readdir(scenesDir);

    const characterMentions: Record<string, number> = {};

    for (const file of sceneFiles) {
        const content = await fs.readFile(path.join(scenesDir, file), 'utf-8');
        const { data } = matter(content);
        if (data.characters && Array.isArray(data.characters)) {
            for (const char of data.characters) {
                characterMentions[char] = (characterMentions[char] || 0) + 1;
            }
        }
    }

    const existingCharFiles = await fs.readdir(charactersDir);
    const existingCharacters = new Set(existingCharFiles.map(f => path.parse(f).name));

    const newCharacters: string[] = [];
    for (const [name, count] of Object.entries(characterMentions)) {
        const fileName = name.toLowerCase().replace(/\s+/g, '-');
        if (count >= minMentions && !existingCharacters.has(fileName)) {
            const newChar: Character = {
                name: name,
                role: 'secondaire',
                background: 'À définir',
                personality: [],
            };
            await write_character(bookDir, newChar);
            newCharacters.push(name);
        }
    }
    return newCharacters;
}
