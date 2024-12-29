import clientPromise from './mongodb';

export interface Project {
  name: string;
  client: string;
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
    { name },
    { 
      $set: { 
        ...data,
        updatedAt: new Date() 
      } 
    }
  );
} 