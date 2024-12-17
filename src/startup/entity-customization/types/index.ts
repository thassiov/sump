const CustomizableEntityList = ['account', 'profile'] as const;

type CustomizableEntityProperty = {
  name: string;
  type: 'string' | 'number';
  // right now it represents the size of a string, but I'll work on numbers later
  size?: number;
  // sensitive?: boolean;
  defaultValue?: string | number;
  allowNull?: boolean;
  unique?: boolean;
};

type CustomizableEntity = (typeof CustomizableEntityList)[number];
type CustomizableEntityRecord = Record<
  CustomizableEntity,
  CustomizableEntityProperty[]
>;

export type {
  CustomizableEntity,
  CustomizableEntityProperty,
  CustomizableEntityRecord,
};

export { CustomizableEntityList };
