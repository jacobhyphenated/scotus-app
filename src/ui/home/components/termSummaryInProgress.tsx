import { LocalDate } from '@js-joda/core';
import React, { useMemo } from 'react';
import { Case, dismissedCases } from '../../../stores/caseStore';
import { shuffleArray } from '../../../util';
import { CaseGridRow } from './';

interface Props {
  cases: Case[]
  onCaseClick?: (scotusCase: Case) => void;
}

const random3Cases: (cases: Case[]) => Case[] = cases => ([
  ...shuffleArray(cases.filter(c => c.important)),
  ...shuffleArray(cases.filter(c => !c.important)),
].slice(0,4));

const TermSummaryInProgress = (props: Props) => {

  const decided = props.cases.filter(c => c.decisionDate)
    .sort((c1, c2) => c2.decisionDate!.compareTo(c1.decisionDate!));
  const open = props.cases.filter(c => !dismissedCases(c) && !c.argumentDate);
  
  const recentlyDecided = [
    ...decided.filter(c => c.important),
    ...decided.filter(c => !c.important),
  ].slice(0,4);
  const awaitingDecision = random3Cases(
    props.cases.filter(c => !c.decisionDate && c.argumentDate?.isBefore(LocalDate.now()) && !dismissedCases(c)),
  );
  const keyCases = random3Cases([
    ...open, 
    ...props.cases.filter(c => ![...recentlyDecided, ...awaitingDecision, ...open].find(rd => rd.id === c.id)),
  ]);

  const keyLink = useMemo(() => {
    const termId = props.cases[0].term.id;
    return {
      text: 'All Key Cases',
      to: `/term/${termId}/key`,
    };
  }, [props.cases]);

  return (
    <>
      <CaseGridRow cases={recentlyDecided} title="Recently Decided" onCaseClick={props.onCaseClick} />
      <CaseGridRow cases={awaitingDecision} title="Awaiting Decision" onCaseClick={props.onCaseClick} />
      <CaseGridRow cases={keyCases} title="Key Cases" onCaseClick={props.onCaseClick} link={keyLink} />
    </>
  );
};

export default React.memo(TermSummaryInProgress);