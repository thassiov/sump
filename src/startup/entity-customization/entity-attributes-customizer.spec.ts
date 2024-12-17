// describe('get customizable entities', () => {
//   it('should retrieve the entities stored in the utility class', () => {
//     const instance = new ContentsVerificationUtil(
//       validCustomisableEntityYaml
//     );
//     instance.loadCustomizableEntityYaml();
//     instance.validateCustomizableEntity();
//     const result = instance.getCustomizableEntities();
//
//     expect(result).toHaveProperty('account[0]', {
//       name: 'password',
//       type: 'string',
//       sensitive: true,
//       defaultValue: 'this is secure',
//     });
//
//     expect(result).toHaveProperty('account[1]', {
//       name: 'phone',
//       type: 'string',
//       sensitive: true,
//       defaultValue: '+535323423423',
//     });
//   });
// });
