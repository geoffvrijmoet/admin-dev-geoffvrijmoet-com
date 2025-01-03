import clientPromise from './mongodb';
import { ObjectId } from 'mongodb';

export interface Project {
  _id?: ObjectId;
  client: string;
  project: string;
  name: string;
  rate?: number;
  rateType?: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function getProjects() {
  const client = await clientPromise;
  const projects = client.db().collection<Project>('projects');
  
  return projects.find({}).toArray();
}

export async function addProject(project: Project) {
  const client = await clientPromise;
  const projects = client.db().collection<Project>('projects');
  
  return projects.insertOne({
    ...project,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

export async function updateProject(name: string, data: Partial<Project>) {
  const client = await clientPromise;
  const projects = client.db().collection<Project>('projects');
  
  return projects.updateOne(
    { project: name },
    { 
      $set: { 
        ...data,
        updatedAt: new Date() 
      } 
    }
  );
} 