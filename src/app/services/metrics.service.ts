import { AggregationData } from './../entities/aggregationData';
import { Injectable } from '@angular/core';
import * as bodybuilder from 'bodybuilder';

@Injectable()
export class MetricsService {
  listeOperationsMetrics = [
    {key: 'null', value: 'Pas d\'aggrégations'},
    {key: 'sum', value: 'Somme'},
    {key: 'avg', value: 'Moyenne'},
    {key: 'min', value: 'Minimum'},
    {key: 'max', value: 'Maximum'},
    {key: 'count', value: 'Count'},
    {key: 'sum', value: 'Top Hit'},
    {key: 'percentiles', value: 'Percentiles'},
    {key: 'sum', value: 'Median'},
    {key: 'extended_stats', value: 'Stat'},
    {key: 'cardinality', value: 'Cardinality'}
  ];

  constructor() { }

  _getAggResult(response: any, agg: AggregationData): any {
    // const aggResponse = (response.aggregations) ? response.aggregations[agg.id] : response[agg.id] || null;
    // permet de recuprer le nom du key de l'objet
    let nameAggregation;
    let aggResponse;
    if (agg.type !== 'count') {
      nameAggregation = Object.keys(response.aggregations)[0];
      aggResponse =
        (response.aggregations) ? response.aggregations[nameAggregation] : response[nameAggregation] || null;
    }
    switch (agg.type) {
      case 'count':
        return this._getCountResult(response);
      case 'avg':
        return this._getSimpleResult('Average ' + agg.params.field, aggResponse, agg);
      case 'sum':
        return this._getSimpleResult('Sum of ' + agg.params.field, aggResponse, agg);
      case 'min':
        return this._getSimpleResult('Minimum ' + agg.params.field, aggResponse, agg);
      case 'max':
        return this._getSimpleResult('Maximum ' + agg.params.field, aggResponse, agg);
      case 'cardinality':
        return this._getSimpleResult('Unique count of ' + agg.params.field, aggResponse, agg);
      // case 'median':
      //   return this._getMedianResult(aggResponse, agg);
      case 'extended_stats':
        return this._getStdResult(aggResponse, agg);
      // case 'percentiles':
      //   return this._getPercentilesResult(aggResponse, agg);
      // case 'percentile_ranks':
      //   return this._getPercentileRanksResult(aggResponse, agg);
      // case 'top_hits':
      //   return this._getTopHitsResult(aggResponse, agg);
    }
  }
  private _getStdResult(aggResponse: any, agg: AggregationData): any[] {
    return [
      {
        label: ('Lower Standard Deviation of ' + agg.params.field),
        result: aggResponse.std_deviation_bounds.lower,
        aggregation: agg
      },
      {
        label: ('Upper Standard Deviation of ' + agg.params.field),
        result: aggResponse.std_deviation_bounds.upper,
        aggregation: agg
      },
      {
        label: ('Stat global of ' + agg.params.field),
        result: 'Count' + aggResponse.count + ',Sum ' + aggResponse.count + ' ,Min' + aggResponse.count,
        aggregation: agg
      },
    ];
  }

  private _getAggByIdMap(aggs: AggregationData[]): Map<string, AggregationData> {
    const aggByIdMap = new Map<string, AggregationData>();
      for (let i = 0; i < aggs.length; i++) {
        aggByIdMap.set(aggs[i].id, aggs[i]);
      }
    return aggByIdMap;
  }

  _getCountResult(response: any): any[] {
    return [{
      label: 'Count',
      result: (response.hits) ? response.hits.total : response.doc_count || '--'
    }];
  }

  // This method is avilable for aggs: avg, sum, min, max, cardinality
  private _getSimpleResult(label: string, aggResponse: any, agg: AggregationData): any[] {
    return [{
      label: label,
      result: aggResponse.value,
      aggregation: agg
    }];
  }

}
