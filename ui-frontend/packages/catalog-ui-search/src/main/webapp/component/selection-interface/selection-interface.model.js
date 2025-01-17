/**
 * Copyright (c) Codice Foundation
 *
 * This is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser
 * General Public License as published by the Free Software Foundation, either version 3 of the
 * License, or any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without
 * even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details. A copy of the GNU Lesser General Public License
 * is distributed along with this program and can be found at
 * <http://www.gnu.org/licenses/lgpl.html>.
 *
 **/

const _ = require('underscore')
const Backbone = require('backbone')
const Metacard = require('../../js/model/Metacard.js')
import { Query as QueryModel } from '../../js/model/Query'
const QueryResponse = require('../../js/model/QueryResponse.js')
const QueryResult = require('../../js/model/QueryResult.js')

module.exports = Backbone.AssociatedModel.extend({
  relations: [
    {
      type: Backbone.One,
      key: 'currentQuery',
      relatedModel: QueryModel.Model,
    },
    {
      type: Backbone.One,
      key: 'currentMetacard',
      relatedModel: QueryResponse,
    },
    {
      type: Backbone.Many,
      key: 'selectedResults',
      relatedModel: Metacard,
    },
    {
      type: Backbone.Many,
      key: 'activeSearchResults',
      relatedModel: QueryResult,
    },
    {
      type: Backbone.Many,
      key: 'completeActiveSearchResults',
      relatedModel: QueryResult,
    },
  ],
  defaults: {
    currentQuery: undefined,
    currentMetacard: undefined,
    selectedResults: [],
    activeSearchResults: [],
    activeSearchResultsAttributes: [],
  },
  initialize() {
    this.set('currentResult', new QueryResponse())
    this.listenTo(this, 'change:currentMetacard', this.handleUpdate)
    this.listenTo(this, 'change:currentMetacard', this.handleCurrentMetacard)
    this.listenTo(this, 'change:currentResult', this.handleResultChange)
    this.listenTo(
      this.get('activeSearchResults'),
      'update add remove reset',
      this.updateActiveSearchResultsAttributes
    )
  },
  handleResultChange() {
    this.listenTo(
      this.get('currentResult'),
      'sync reset:results',
      this.handleResults
    )
  },
  handleResults() {
    this.set(
      'currentMetacard',
      this.get('currentResult').get('results').first()
    )
  },
  updateActiveSearchResultsAttributes() {
    const availableAttributes = this.get('activeSearchResults')
      .reduce((currentAvailable, result) => {
        currentAvailable = _.union(
          currentAvailable,
          Object.keys(result.get('metacard').get('properties').toJSON())
        )
        return currentAvailable
      }, [])
      .sort()
    this.set('activeSearchResultsAttributes', availableAttributes)
  },
  getActiveSearchResultsAttributes() {
    return this.get('activeSearchResultsAttributes')
  },
  handleUpdate() {
    this.clearSelectedResults()
    this.setActiveSearchResults(this.get('currentResult').get('results'))
    this.addSelectedResult(this.get('currentMetacard'))
  },
  handleCurrentMetacard() {
    if (this.get('currentMetacard') !== undefined) {
      this.get('currentQuery').cancelCurrentSearches()
    }
  },
  getActiveSearchResults() {
    return this.get('activeSearchResults')
  },
  setActiveSearchResults(results) {
    this.get('activeSearchResults').reset(results.models || results)
  },
  addToActiveSearchResults(results) {
    this.get('activeSearchResults').add(results.models || results)
  },
  setSelectedResults(results) {
    this.get('selectedResults').reset(results.models || results)
  },
  getSelectedResults() {
    return this.get('selectedResults')
  },
  clearSelectedResults() {
    this.getSelectedResults().reset()
  },
  addSelectedResult(metacard) {
    this.getSelectedResults().add(metacard)
  },
  removeSelectedResult(metacard) {
    this.getSelectedResults().remove(metacard)
  },
  setCurrentQuery(query) {
    this.set('currentQuery', query)
  },
  getCurrentQuery() {
    return this.get('currentQuery')
  },
})
