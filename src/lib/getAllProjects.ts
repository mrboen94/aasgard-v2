import groq from 'groq'
import client from '../../client'

interface IProject {}

export default async function getAllProjects() {
  let projects = await client.fetch(
    groq`*[_type == "project"] | order(_createdAt desc)
        {
            "technologies":technologies[]->{
                title, 
                description, 
                logo
            },
            ...
        }`
  )
  return projects
}
