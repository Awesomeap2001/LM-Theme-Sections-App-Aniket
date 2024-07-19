import path from "path";
import fs from "fs/promises";

// Function to check if a directory exists
async function directoryExists(directory) {
  try {
    await fs.access(directory);
    return true;
  } catch {
    return false;
  }
}

// Function to read all files in a directory asynchronously
async function readFilesInDirectory(directory) {
  try {
    const files = await fs.readdir(directory);
    const fileContents = await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(directory, file);
        const content = await fs.readFile(filePath, "utf-8");
        return {
          name: file,
          content,
        };
      }),
    );
    return fileContents;
  } catch (err) {
    console.error(`Error reading directory ${directory}:`, err);
    return [];
  }
}

// Function to get all files for a given sectionId
export async function getAllFiles(sectionId) {
  try {
    const assetsDirectory = path.resolve(`theme_sections/${sectionId}/assets`);
    const sectionDirectory = path.resolve(
      `theme_sections/${sectionId}/section`,
    );

    const sectionFolderExists = await directoryExists(
      path.resolve(`theme_sections/${sectionId}`),
    );

    if (!sectionFolderExists) {
      throw new Error(
        `The directory for sectionId ${sectionId} does not exist.`,
      );
    }

    // Check if directories exist
    const sectionExists = await directoryExists(sectionDirectory);
    const assetsExists = await directoryExists(assetsDirectory);

    if (!sectionExists && !assetsExists) {
      throw new Error(
        `The directory for sectionId ${sectionId} does not exist.`,
      );
    }

    const sections = sectionExists
      ? await readFilesInDirectory(sectionDirectory)
      : [];
    const assets = assetsExists
      ? await readFilesInDirectory(assetsDirectory)
      : [];

    return { assets, sections };
  } catch (error) {
    console.error(`Error getting files for section ${sectionId}`);
    return { assets: [], sections: [] };
  }
}

export async function addSectionToTheme(sectionId, themeId, session, admin) {
  const { sections, assets } = await getAllFiles(sectionId);

  // Check if directories were valid
  if (sections.length === 0 && assets.length === 0) {
    return {
      success: false,
      message: `No files found for section.`,
    };
  }

  const asset = new admin.rest.resources.Asset({ session });

  // Function to upload a single file and track results
  async function uploadFile(file, directory) {
    asset.theme_id = themeId;
    asset.key = `${directory}/${file.name}`;
    asset.value = file.content;
    try {
      await asset.save({ update: true });
      console.log(`Successfully uploaded ${asset.key}`);
    } catch (error) {
      console.error(`Error uploading ${asset.key}:`, error);
      throw new Error(`Error uploading ${asset.key}: ${error.message}`);
    }
  }

  // Upload section files
  for (const file of sections) {
    await uploadFile(file, "sections");
  }

  // Upload asset files
  for (const file of assets) {
    await uploadFile(file, "assets");
  }

  return {
    success: true,
    message: "Section added successfully",
  };
}
