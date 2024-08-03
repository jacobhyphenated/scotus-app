import { createGlossaryByAlphabetical, createGlossaryByGroup, GlossaryItem } from "./glossaryService";

describe('Glossary Service', () => {
  it('should sort glossary items alphabetically', () =>{
    const result = createGlossaryByAlphabetical(testGlossary);
    expect(result.length).toBe(4);
    expect(result[0].name).toBe('Intermediate Scrutiny');
    expect(result[1].name).toBe('Procedural Due Process');
    expect(result[2].name).toBe('Strict Scrutiny');
    expect(result[3].name).toBe('Substantive Due Process');
  });

  it('should group glossary items', () => {
    const result = createGlossaryByGroup(testGlossary);
    expect(result.size).toBe(2);
    expect(result.keys()).toContain('Doctrine');
    expect(result.keys()).toContain('Standards of Scrutiny');
    expect(result.get('Doctrine')?.[0].name).toBe('Procedural Due Process');
    expect(result.get('Doctrine')?.[1].name).toBe('Substantive Due Process');
    expect(result.get('Standards of Scrutiny')?.[0].name).toBe('Intermediate Scrutiny');
  });
});

const testGlossary: GlossaryItem[] = [
  {
      name: 'Substantive Due Process',
      definition: 'The Fifth and Fourteenth Amendments prohibit the government from depriving any person of “life, liberty, or property without due process of law." Substantive Due Process is the principle that certain rights are alluded to, but not explicitly defined in the Bill of Rights. Examples of constitutional rights guaranteed under this principle include the right to marry an individual of a different race (Loving v. Virginia) or of the same sex (Obergefell), the right to privacy, and the right to contraceptives (Griswold v. Connecticut).',
      group: 'Doctrine',
  },
  {
      name: 'Procedural Due Process',
      definition: 'The principle that when the government acts to deprive an individual of life, liberty, or property, that individual must be given notice, the opportunity to be heard, and the decision must come from a nuetral party.',
      group: 'Doctrine',
  },
  {
      name: 'Strict Scrutiny',
      definition: 'Standard for evaluating the constitutionality of a law that restricts an individual\'s constitutional right. The law is presumed invalid unless the government can show that the law is narrowly tailored to acheive a compelling purpose and uses the least restrictive means to do so. This is the most difficult level of scritiny to overcome.',
      group: 'Standards of Scrutiny',
  },
  {
      name: 'Intermediate Scrutiny',
      definition: 'Standard for evaluating the constitutionality of a law that descriminates or negatively effects a protected class. This standard is sometimes called Exacting Scrutiny. To overcome this standard, the government must show that the law furthers an important government interest and does so in a way that is substantially related to that interest.',
      group: 'Standards of Scrutiny',
  },
];