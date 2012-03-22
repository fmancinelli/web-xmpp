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

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

import org.apache.vysper.mina.TCPEndpoint;
import org.apache.vysper.storage.OpenStorageProviderRegistry;
import org.apache.vysper.storage.StorageProviderRegistry;
import org.apache.vysper.xmpp.modules.extension.xep0045_muc.MUCModule;
import org.apache.vysper.xmpp.modules.extension.xep0049_privatedata.PrivateDataModule;
import org.apache.vysper.xmpp.modules.extension.xep0054_vcardtemp.VcardTempModule;
import org.apache.vysper.xmpp.modules.extension.xep0092_software_version.SoftwareVersionModule;
import org.apache.vysper.xmpp.modules.extension.xep0119_xmppping.XmppPingModule;
import org.apache.vysper.xmpp.modules.extension.xep0202_entity_time.EntityTimeModule;
import org.apache.vysper.xmpp.modules.roster.persistence.MemoryRosterManager;
import org.apache.vysper.xmpp.server.XMPPServer;

/**
 * This context listener is used to start a Vysper server when the web application is deployed. The server is made
 * available to other servlets via a context attribute.
 * 
 * @version $Id$
 */
public class VysperListener implements ServletContextListener
{
    /**
     * The domain to be used to the server.
     */
    private static final String SERVER_DOMAIN = "web-xmpp";

    /**
     * The XMPP server.
     */
    private XMPPServer server;

    /**
     * {@inheritDoc}
     */
    public void contextInitialized(ServletContextEvent sce)
    {
        try {
            StorageProviderRegistry providerRegistry = new OpenStorageProviderRegistry();
            providerRegistry.add(new MemoryRosterManager());
            providerRegistry.add(new NullUserAuthorization());

            server = new XMPPServer(SERVER_DOMAIN);
            /* Also open a TCP endpoint on port 5222 so that desktop clients can connect as well. */
            server.addEndpoint(new TCPEndpoint());
            server.setStorageProviderRegistry(providerRegistry);

            server.setTLSCertificateInfo(sce.getServletContext().getResourceAsStream("/WEB-INF/bogus_mina_tls.cert"),
                "boguspw");

            server.start();

            server.addModule(new SoftwareVersionModule());
            server.addModule(new EntityTimeModule());
            server.addModule(new VcardTempModule());
            server.addModule(new XmppPingModule());
            server.addModule(new PrivateDataModule());
            server.addModule(new MUCModule());

            sce.getServletContext().setAttribute(Constants.XMPP_SERVER_ATTRIBUTE, server);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /**
     * {@inheritDoc}
     */
    public void contextDestroyed(ServletContextEvent sce)
    {
        server.stop();
    }

}
