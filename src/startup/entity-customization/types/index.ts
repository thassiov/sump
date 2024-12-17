const CustomizableEntityList = ['account', 'profile'] as const;

type CustomizableEntityProperty = {
  name: string;
  type: 'string' | 'number';
  sensitive?: boolean;
  defaultValue?: string | number;
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
