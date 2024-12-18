import z from 'zod';

const uuidv4Schema = z.string().uuid();

export { uuidv4Schema };
