import { FullDocket } from "../../../stores/docketStore";
import { groupBy } from "../../../util/functional";


export const groupDocketsByDecision = (dockets: FullDocket[]) => {
  const grouped = groupBy(dockets, 'lowerCourtRuling');
  const groupedDockets = Array.from(grouped.keys()).flatMap((key) => {
    const values = grouped.get(key)!;
    if (values.every( d => d.lowerCourt.id === values[0].lowerCourt.id)) {
      return [{
        lowerCourt: values[0].lowerCourt.name,
        lowerCourtRuling: values[0].lowerCourtRuling,
        docketIdentifiers: values.map( value => ({
          docketId: value.id,
          docketNumber: value.docketNumber,
          title: value.title,
        })),
      }];
    } else {
      return values.map( value => ({
        lowerCourt: value.lowerCourt.name,
        lowerCourtRuling: value.lowerCourtRuling,
        docketIdentifiers: [{
          docketId: value.id,
          docketNumber: value.docketNumber,
          title: value.title,
        }],
      }));
    }
  });
  return groupedDockets;
};