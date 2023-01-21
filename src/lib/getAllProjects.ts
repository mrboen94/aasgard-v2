import groq from 'groq'
import client from '../../client'

export default async function getAllProjects() {
  let projects = await client.fetch(
    groq`*[_type == "project"] | order(_createdAt desc)
        {
            "technologies":technologies[]->{
                title, 
                description, 
                logo
            },
            logo->,
            github,
            completed,
            title,
            description,
            id,
            link
        }`
  )
  return projects
}
