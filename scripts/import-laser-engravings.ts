import 'dotenv/config';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { getDatabaseUrl } from '../db/config';
import { laserEngravings as laserEngravingsTable } from '../db/schema';
import {
  assertValidLaserEngravings,
  compareLaserEngravings,
  normalizeLaserEngraving,
  type LaserEngravingSeed,
} from './laser-engravings-import.helpers';

const DATA_FILE_PATH = path.resolve(
  process.cwd(),
  'scripts/laser-engravings-data.json',
);
const INSERT_DELAY_MS = 500;
const pool = new Pool({
  connectionString: getDatabaseUrl(),
});
const db = drizzle({ client: pool });

async function sleep(milliseconds: number): Promise<void> {
  await new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

async function loadAndSortLaserEngravings(): Promise<LaserEngravingSeed[]> {
  const fileContent = await fs.readFile(DATA_FILE_PATH, 'utf8');
  const parsedData: unknown = JSON.parse(fileContent);

  assertValidLaserEngravings(parsedData);

  const sortedLaserEngravings = [...parsedData].sort(compareLaserEngravings);

  await fs.writeFile(
    DATA_FILE_PATH,
    `${JSON.stringify(sortedLaserEngravings, null, 2)}\n`,
    'utf8',
  );

  return sortedLaserEngravings;
}

async function importLaserEngravings(
  laserEngravings: LaserEngravingSeed[],
): Promise<void> {
  let insertedCount = 0;
  let skippedCount = 0;

  for (let index = 0; index < laserEngravings.length; index += 1) {
    const laserEngraving = laserEngravings[index];
    const [existingLaserEngraving] = await db
      .select({ id: laserEngravingsTable.id })
      .from(laserEngravingsTable)
      .where(eq(laserEngravingsTable.id, laserEngraving.id))
      .limit(1);

    if (existingLaserEngraving) {
      skippedCount += 1;
      console.log(
        `Skipping laser engraving ${laserEngraving.id}: already exists`,
      );
      continue;
    }

    const normalizedLaserEngraving = normalizeLaserEngraving(laserEngraving);
    const [savedLaserEngraving] = await db
      .insert(laserEngravingsTable)
      .values({
        id: normalizedLaserEngraving.id,
        slug: normalizedLaserEngraving.slug,
        name: normalizedLaserEngraving.name,
        description: normalizedLaserEngraving.description,
        price: normalizedLaserEngraving.price,
        discount: normalizedLaserEngraving.discount ?? 0,
        quantity: normalizedLaserEngraving.quantity,
        images: normalizedLaserEngraving.images,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning({
        id: laserEngravingsTable.id,
        name: laserEngravingsTable.name,
      });
    insertedCount += 1;
    console.log(
      `Inserted laser engraving ${savedLaserEngraving.id}: ${savedLaserEngraving.name}`,
    );

    if (index < laserEngravings.length - 1) {
      await sleep(INSERT_DELAY_MS);
    }
  }

  console.log(
    `Import finished. Inserted: ${insertedCount}. Skipped existing: ${skippedCount}.`,
  );
}

async function main(): Promise<void> {
  const sortedLaserEngravings = await loadAndSortLaserEngravings();
  console.log(
    `Sorted ${sortedLaserEngravings.length} laser engravings in ${path.relative(
      process.cwd(),
      DATA_FILE_PATH,
    )}.`,
  );
  await importLaserEngravings(sortedLaserEngravings);
}

main()
  .catch((error: unknown) => {
    console.error('Failed to import laser engravings.');
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
