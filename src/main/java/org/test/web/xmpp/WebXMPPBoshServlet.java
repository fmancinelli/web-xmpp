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

import java.io.IOException;
import java.util.Arrays;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;

import org.apache.vysper.xmpp.extension.xep0124.BoshServlet;
import org.apache.vysper.xmpp.server.Endpoint;
import org.apache.vysper.xmpp.server.XMPPServer;

/**
 * This is a subclass of the BoshServlet that binds a BOSH endpoint to the XMPP server that has been initialized and
 * that is made available through servlet context attributes.
 * 
 * @version $Id$
 */
public class WebXMPPBoshServlet extends BoshServlet implements Endpoint
{
    /**
     * Serial version UID.
     */
    private static final long serialVersionUID = -3960093311691945133L;

    @Override
    public void init(ServletConfig sc) throws ServletException
    {
        XMPPServer server = (XMPPServer) sc.getServletContext().getAttribute(Constants.XMPP_SERVER_ATTRIBUTE);
        if (server == null) {
            throw new ServletException("No vysper server available");
        }

        server.addEndpoint(this);
        setServerRuntimeContext(server.getServerRuntimeContext());
        setAccessControlAllowOrigin(Arrays.asList("*"));
    }

    /**
     * {@inheritDoc}
     */
    public void start() throws IOException
    {
        /* Don't do anything. This is managed by the servlet container. */
    }

    /**
     * {@inheritDoc}
     */
    public void stop()
    {
        /* Don't do anything. This is managed by the servlet container. */
    }
}
