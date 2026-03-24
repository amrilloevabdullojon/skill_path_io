export type ModuleSeed = {
  id: string;
  title: string;
  description: string;
  order: number;
};

export type TrackSeed = {
  id: string;
  slug: string;
  title: string;
  description: string;
  level: "Junior" | "Middle";
  durationWeeks: number;
  modules: ModuleSeed[];
};

export const tracksSeed: TrackSeed[] = [
  {
    id: "qa-engineer",
    slug: "qa-engineer",
    title: "QA Engineer",
    description: "Track focused on manual testing and test automation basics.",
    level: "Junior",
    durationWeeks: 14,
    modules: [
      {
        id: "qa-fundamentals",
        title: "QA Fundamentals",
        description: "Testing lifecycle, test levels, and test types.",
        order: 1,
      },
      {
        id: "qa-web-testing",
        title: "Web Testing",
        description: "Test design, checklists, bug reports, and regression coverage.",
        order: 2,
      },
      {
        id: "qa-api-testing",
        title: "API Testing",
        description: "REST API checks with Postman and contract validation basics.",
        order: 3,
      },
    ],
  },
  {
    id: "business-analyst",
    slug: "business-analyst",
    title: "Business Analyst",
    description: "Track for requirement discovery and business process modeling.",
    level: "Junior",
    durationWeeks: 12,
    modules: [
      {
        id: "ba-discovery",
        title: "Discovery and Stakeholders",
        description: "Defining product goals and running stakeholder interviews.",
        order: 1,
      },
      {
        id: "ba-requirements",
        title: "Requirements Engineering",
        description: "Functional and non-functional requirements, user stories.",
        order: 2,
      },
      {
        id: "ba-modeling",
        title: "Process Modeling",
        description: "BPMN/UML and handoff-ready specifications.",
        order: 3,
      },
    ],
  },
  {
    id: "data-analyst",
    slug: "data-analyst",
    title: "Data Analyst",
    description: "Track covering SQL, metrics, visualization, and insight delivery.",
    level: "Middle",
    durationWeeks: 16,
    modules: [
      {
        id: "da-sql",
        title: "SQL for Analysts",
        description: "Queries, aggregations, joins, and window functions.",
        order: 1,
      },
      {
        id: "da-product-metrics",
        title: "Product Metrics",
        description: "KPIs, funnels, cohort analysis, and A/B interpretation.",
        order: 2,
      },
      {
        id: "da-visualization",
        title: "Visualization and Storytelling",
        description: "Building dashboards and presenting insights.",
        order: 3,
      },
    ],
  },
];

export function getTrackBySlug(trackSlug: string) {
  return tracksSeed.find((track) => track.slug === trackSlug);
}

export function getModuleById(trackSlug: string, moduleId: string) {
  const track = getTrackBySlug(trackSlug);
  if (!track) {
    return undefined;
  }
  return track.modules.find((module) => module.id === moduleId);
}
