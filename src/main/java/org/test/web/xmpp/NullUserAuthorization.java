/* 
 * Web XMPP
 * Copyright 2012 Fabio Mancinelli <fabio@mancinelli.me>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.test.web.xmpp;

import org.apache.vysper.xmpp.addressing.Entity;
import org.apache.vysper.xmpp.authorization.UserAuthorization;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * This class authorizes everyone to connect to the server.
 * 
 * @version $Id$
 */
public class NullUserAuthorization implements UserAuthorization
{
    /**
     * Logger.
     */
    private static Logger logger = LoggerFactory.getLogger(NullUserAuthorization.class);

    /**
     * {@inheritDoc}
     */
    public boolean verifyCredentials(Entity jid, String passwordCleartext, Object credentials)
    {
        logger.info("User with JID {} is logging in", jid.toString());
        return true;
    }

    /**
     * {@inheritDoc}
     */
    public boolean verifyCredentials(String username, String passwordCleartext, Object credentials)
    {
        logger.info("User {} is logging in", username);
        return true;
    }

}
