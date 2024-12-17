import { DataTypes, ModelAttributes } from 'sequelize';
import { CustomizableEntityProperty } from './types';

function entityAttributesCustomizer(
  defaultAttributes: ModelAttributes,
  newAttributes: CustomizableEntityProperty[]
): ModelAttributes {
  const newEntityAttributes = { ...defaultAttributes };

  newAttributes.forEach((attribute: CustomizableEntityProperty) => {
    newEntityAttributes[attribute.name] = {
      type: attribute.type === 'string' ? DataTypes.STRING : DataTypes.INTEGER,
    };
  });

  return newEntityAttributes;
}

export { entityAttributesCustomizer };
