import S from '@sanity/desk-tool/structure-builder'

const excludedIds = ['staticInfo']

export default () =>
  S.list()
    .title('Content')
    .items([
      ...S.documentTypeListItems().filter(
        (item) => !excludedIds.includes(item.getId())
      ),
      // Add a visual divider
      S.divider(),
      S.documentListItem().id('staticContent').schemaType('staticInfo'),
    ])
