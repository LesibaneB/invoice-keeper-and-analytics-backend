import {
    registerDecorator,
    ValidationOptions,
    ValidationArguments,
  } from 'class-validator';
  
  export function IsNumberLength(
    property: number,
    validationOptions?: ValidationOptions,
  ) {
    // eslint-disable-next-line @typescript-eslint/ban-types
    return function (object: Object, propertyName: string) {
      registerDecorator({
        name: 'IsNumberLength',
        target: object.constructor,
        propertyName: propertyName,
        constraints: [property],
        options: validationOptions,
        validator: {
          validate(value: any, args: ValidationArguments) {
            const contraint = args.constraints[0];
            return (
              typeof value === 'number' &&
              typeof contraint === 'number' &&
              value.toString().length === contraint
            );
          },
        },
      });
    };
  }
  