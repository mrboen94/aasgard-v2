import createSchema from 'part:@sanity/base/schema-creator'

import schemaTypes from 'all:part:@sanity/base/schema-type'

import category from './documents/category'
import post from './documents/post'
import author from './documents/author'
import imageGrid from './documents/staticInfo'
import imageWithAlt from './objects/imageWithAlt'
import videoContent from './objects/videoContent'

export default createSchema({
  name: 'default',
  types: schemaTypes.concat([
    post,
    author,
    category,
    imageGrid,
    imageWithAlt,
    videoContent,
  ]),
})
