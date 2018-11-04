import { VisualizationState } from './visualizationState';
import { SearchSourceJSON } from './searchSourceJSON';

export class VisualizationObj {
    title: string;
    type: string;
    visState: {
        options: string,
        name_type_chart: string,
        type: string,
        index: string,
        aggregation: {
            aggreg: string, // va contenir l'aggrégation en tant que tel
            params: string
        };
        /**
         * Ici on aura l'objet 'params' pour contenir les parametres a savoir le 'type': date_histogram,
         * 'nom_champ': 'Date' ....
         */
    };
    otherSavedObjectMeta: {
        searchSourceJSON: string
    };
}
