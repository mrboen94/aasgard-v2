const excludedIds = ['staticInfo', 'photography']

export default (S) =>
  S.list()
    .title('Content')
    .items([
      ...S.documentTypeListItems().filter(
        (item) => !excludedIds.includes(item.getId())
      ),
      // Add a visual divider
      S.divider(),
      S.documentListItem().id('staticContent').schemaType('staticInfo'),
      S.documentListItem().id('photography').schemaType('photography'),
    ])
