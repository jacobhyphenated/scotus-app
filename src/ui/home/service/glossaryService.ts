import { groupBy } from "../../../util/functional";

export interface GlossaryItem {
  name: string;
  definition: string;
  group: string;
}

//TODO: This class is a placeholder. It's not really useful unless/until glossary data is loaded from an external data source.
// The contract should be similar, but referencing the hard coded "glossary" variable at class construction
// is not the long term pattern
export class GlossaryService {
  
  glossaryByAlphabetical = createGlossaryByAlphabetical(glossary);
  glossaryByGroup = createGlossaryByGroup(glossary);

}

export const createGlossaryByAlphabetical = (input: GlossaryItem[]): GlossaryItem[] => {
  return input.slice().sort((a,b) => a.name.localeCompare(b.name));
};

export const createGlossaryByGroup = (input: GlossaryItem[]): Map<string, GlossaryItem[]> => {
  const groups = groupBy(input, 'group');
  groups.forEach((value, _) => {
    value.sort((a,b) => a.name.localeCompare(b.name));
  });
  return groups;
};

const glossary: GlossaryItem[] = [
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
  {
      name: 'Rational Basis Test',
      definition: 'The minimum standard a law must overcome to be considered constitutional. To pass the Rational Basis test, a statute must have a legitimate state interest, and there must be a rational connection between the statute\'s means and goals.',
      group: 'Standards of Scrutiny',
  },
  {
      name: 'Mens Rea',
      definition: 'The intention or knowledge of wrongdoing that constitutes part of a crime. For criminal statutes with a Mens Rea element, the government must show that the defendant must have had criminal intent and been aware that their actions constituted a crime.',
      group: 'Legal Elements',
  },
  {
      name: 'Scienter',
      definition: 'Guilty knowledge that is sufficient to charge a person with the consequences of their actions. Scienter is similar to Mens Rea but is more broadly applicable to civil liabilty cases.',
      group: 'Legal Elements',
  },
  {
      name: 'Beyond a Reasonable Doubt',
      definition: 'The burden of proof required to obtain a conviction in a criminal case. The prosecution must show that there is no other reasonable explanation that can be concluded from the evidence presented at trial to overcome this burden.',
      group: 'Evidentiary Standards',
  },
  {
      name: 'Clear and Convincing Evidence',
      definition: 'The burden of proof that is less stringent than Beyond a Reasonable Doubt and can be used in both civil and criminal trials. Different states set different evidentiary standards, but the standard of Clear and Convincing Evidence is often used with wills and certain fraud cases. To overcome this standard, the evidence must be highly and substantially more likely to be true than untrue.',
      group: 'Evidentiary Standards',
  },
  {
      name: 'Preponderance of Evidence',
      definition: 'The lowest burden of proof that is often the standard in civil trials. The party with the burden must show that there is a greater than 50% chance that the claim is true.',
      group: 'Evidentiary Standards',
  },
  {
      name: 'Equitable Tolling',
      definition: 'The principle of tort law where an individual may bring a claim after the statute of limitations if the individual did not discover the injury beforehand.',
      group: 'Judicial Procedure',
  },
  {
      name: 'Dormant Commerce Clause',
      definition: 'The doctrine, implicit in the Commerce Clause, that prohibits states from passing laws that descriminate against interstate commerce or otherwise unduly burden out of state actors.',
      group: 'Doctrine',
  },
  {
      name: 'Qualified Immunity',
      definition: 'The doctrine that applies to government officials in civil litigation who violate someones constitutional rights while performing discretionary functions. The official is immune from lawsuits unless the plaintiff can show the official violated a clearly established constitutional right. To qualify as a clearly established right, there should be a nearly identical precedent in the circuit court or the supreme court.',
      group: 'Doctrine',
  },
  {
      name: 'Summary Judgement',
      definition: 'A type of pre-trial motion in a civil case. If there is no dispute regarding material facts, the motion allows a judgement on the matter of law that may resolve the case.',
      group: 'Judicial Procedure',
  },
  {
      name: 'Interlocutory Appeal',
      definition: 'An appeal of a non-final order during ongoing litigation. Interlocutory appeals are rare and are only allowed under specific circumstances.',
      group: 'Judicial Procedure',
  },
  {
      name: 'Qui Tam',
      definition: 'A Qui Tam action permits a private individual to file suit on behalf of a government entity and collect a share of the judgement. A Qui Tam action must be explicitly authorized by statute.',
      group: 'Judicial Procedure',
  },
  {
      name: 'Certiorari',
      definition: 'A type of writ in which a higher court (often an appeals court) reviews the decision of a lower court. Certiorari is granted in cases where SCOTUS agrees to hear arguments in the case.',
      group: 'Judicial Procedure',
  },
  
];