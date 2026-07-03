// frequency list sources — extensible for future dropdown selector

export interface FrequencySource {
  id: string;
  name: string;
  /** path under public/ to fetch at runtime */
  dataPath: string;
}

export const sources: FrequencySource[] = [
  {
    id: 'rioplatense-parenting',
    name: 'Rioplatense parenting (YouTube)',
    dataPath: '/data/rioplatense-parenting.json',
  },
];

export const defaultSource = sources[0];

export interface FrequencyListData {
  id: string;
  name: string;
  lemmas: { lemma: string; frequency: number }[];
}