package com.newpulse.article;

import com.newpulse.category.NewsCategory;
import com.newpulse.common.ArticleIdExtractor;
import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import javax.xml.parsers.DocumentBuilderFactory;
import org.springframework.stereotype.Component;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

@Component
public class RssItemParser {

    public List<RssItem> parse(String xml, NewsCategory category) {
        if (xml == null || xml.isBlank()) {
            throw new IllegalArgumentException("rss xml is required");
        }
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            factory.setNamespaceAware(true);
            factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
            Document document = factory.newDocumentBuilder()
                    .parse(new ByteArrayInputStream(xml.getBytes(StandardCharsets.UTF_8)));
            NodeList items = document.getElementsByTagName("item");
            List<RssItem> parsed = new ArrayList<>();
            for (int i = 0; i < items.getLength(); i++) {
                Element item = (Element) items.item(i);
                String title = childText(item, "title");
                String link = childText(item, "link");
                String pubDate = childText(item, "pubDate");
                String creator = childText(item, "creator");
                if (creator == null) {
                    creator = childText(item, "dc:creator");
                }
                parsed.add(new RssItem(
                        ArticleIdExtractor.extract(link),
                        required(title, "rss title is required"),
                        required(link, "rss link is required"),
                        creator,
                        OffsetDateTime.parse(required(pubDate, "rss pubDate is required"), DateTimeFormatter.RFC_1123_DATE_TIME),
                        category
                ));
            }
            return parsed;
        } catch (Exception e) {
            throw new IllegalArgumentException("rss xml cannot be parsed", e);
        }
    }

    private static String childText(Element element, String name) {
        NodeList children = element.getChildNodes();
        for (int i = 0; i < children.getLength(); i++) {
            Node child = children.item(i);
            String localName = child.getLocalName();
            String nodeName = child.getNodeName();
            if (name.equals(localName) || name.equals(nodeName)) {
                String text = child.getTextContent();
                return text == null ? null : text.trim();
            }
        }
        return null;
    }

    private static String required(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(message);
        }
        return value;
    }
}
