import sanityClient from '@sanity/client'

export default sanityClient({
  projectId: 'j26i5482', // you can find this in sanity.json
  dataset: 'production', // or the name you chose in step 1
  useCdn: true, // `false` if you want to ensure fresh data
  apiVersion: '2022-10-01',
})
