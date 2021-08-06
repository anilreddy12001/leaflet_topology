/**
 *  
 * Action: tenantMgmtAction.js
 *
 * @version 1.0
 * @author Sunitha.S
 *
 */

import axios from 'axios';
import React, { Component } from 'react';
export const populateEmail = (data) => {
      return function (dispatch) {
          return axios({
              method: data.method,
              url: data.url,
              headers: data.requestHeaders
  
          }).then(function (response) {
              var emailData = response.data.element[0];
              var emailSettingsData = '';
              if (emailData.FromEmail && emailData.ReplyEmail && emailData.FromDisplayName) {
                  emailSettingsData = emailData;
              }
              dispatch({
                  type: 'POPULATE_DATA',
                  payload: {
                      response: emailSettingsData
  
                  }
  
              });
          })
      }
  }