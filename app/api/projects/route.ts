import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

export async function GET() {
  try {
    const projectsCollection = await getCollection('projects');
    const timeLogsCollection = await getCollection('time_logs');
    
    // Get all projects
    const projects = await projectsCollection.find({}).sort({ createdAt: -1 }).toArray();
    
    // Get time logs aggregated by project, handling both ID and name-based matching
    const timeLogAggregation = await timeLogsCollection.aggregate([
      {
        $facet: {
          // Group by projectId for newer entries
          byId: [
            {
              $match: {
                projectId: { $exists: true }
              }
            },
            {
              $group: {
                _id: '$projectId',
                totalHours: { $sum: '$hours' }
              }
            }
          ],
          // Group by projectName and client for legacy entries
          byName: [
            {
              $match: {
                projectId: { $exists: false }
              }
            },
            {
              $group: {
                _id: {
                  projectName: '$projectName',
                  client: '$client'
                },
                totalHours: { $sum: '$hours' }
              }
            }
          ]
        }
      }
    ]).toArray();

    // Extract the results from the facet
    const [{ byId, byName }] = timeLogAggregation;

    // Create maps for both types of matching
    const projectHoursById = new Map(
      byId.map((log: { _id: string; totalHours: number }) => [log._id, log.totalHours])
    );

    const projectHoursByName = new Map(
      byName.map((log: { _id: { client: string; projectName: string }; totalHours: number }) => [
        `${log._id.client}:${log._id.projectName}`,
        log.totalHours
      ])
    );

    // Add total hours and earnings to each project
    const projectsWithTotals = projects.map(project => {
      // Try to find hours by ID first, then fall back to name-based matching
      const hoursById = (projectHoursById.get(project._id.toString()) as number) || 0;
      const hoursByName = (projectHoursByName.get(`${project.client}:${project.projectName}`) as number) || 0;
      const totalHours = hoursById + hoursByName; // Combine both in case there are mixed entries

      const totalEarnings = project.rateType === 'hourly'
        ? totalHours * project.rate
        : project.rate;

      return {
        ...project,
        totalHours,
        totalEarnings
      };
    });

    return NextResponse.json(projectsWithTotals);
  } catch (error: unknown) {
    let errorMessage = 'Failed to fetch projects';
    
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const collection = await getCollection('projects');
    const project = await req.json();
    
    const result = await collection.insertOne(project);
    
    return NextResponse.json({ 
      message: 'Project created successfully',
      _id: result.insertedId 
    });
  } catch (error: unknown) {
    let errorMessage = 'Failed to create project';
    
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}
