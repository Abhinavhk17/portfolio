package com.pm.portfolioapi.service;

import com.pm.portfolioapi.Dto.AnalyticsEventRequest;
import com.pm.portfolioapi.Dto.AnalyticsMetric;
import com.pm.portfolioapi.Dto.AnalyticsOverviewCards;
import com.pm.portfolioapi.Dto.AnalyticsOverviewResponse;
import com.pm.portfolioapi.Dto.AnalyticsSourceBreakdown;
import com.pm.portfolioapi.Dto.AnalyticsTrendPoint;
import com.pm.portfolioapi.model.AnalyticsEvent;
import com.pm.portfolioapi.model.AnalyticsEventType;
import com.pm.portfolioapi.repository.AnalyticsEventRepository;
import org.bson.Document;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.data.mongodb.core.aggregation.ConditionalOperators;
import org.springframework.data.mongodb.core.aggregation.DateOperators;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {
    private static final String DEFAULT_SOURCE = "Direct";
    private static final Set<String> KNOWN_SOURCES = Set.of("LinkedIn", "GitHub", "Google", DEFAULT_SOURCE);

    private final AnalyticsEventRepository analyticsEventRepository;
    private final MongoTemplate mongoTemplate;

    public AnalyticsService(AnalyticsEventRepository analyticsEventRepository, MongoTemplate mongoTemplate) {
        this.analyticsEventRepository = analyticsEventRepository;
        this.mongoTemplate = mongoTemplate;
    }

    public AnalyticsEvent recordEvent(AnalyticsEventRequest request) {
        AnalyticsEvent event = new AnalyticsEvent();
        event.setType(request.type());
        event.setSource(normalizeSource(request.source()));
        event.setProjectId(request.projectId());
        event.setCreatedAt(LocalDateTime.now());
        return analyticsEventRepository.save(event);
    }

    public AnalyticsOverviewResponse getOverview(LocalDate from, LocalDate to) {
        LocalDateTime start = startOfDay(from);
        LocalDateTime end = endOfDay(to);

        long rangeDays = ChronoUnit.DAYS.between(from, to) + 1;
        LocalDate previousFrom = from.minusDays(rangeDays);
        LocalDate previousTo = from.minusDays(1);

        LocalDateTime previousStart = startOfDay(previousFrom);
        LocalDateTime previousEnd = endOfDay(previousTo);

        AnalyticsMetric profileViews = buildMetric(AnalyticsEventType.PROFILE_VIEW, start, end, previousStart, previousEnd);
        AnalyticsMetric projectViews = buildMetric(AnalyticsEventType.PROJECT_VIEW, start, end, previousStart, previousEnd);
        AnalyticsMetric contactRequests = buildMetric(AnalyticsEventType.CONTACT_SUBMIT, start, end, previousStart, previousEnd);
        AnalyticsMetric cvDownloads = buildMetric(AnalyticsEventType.CV_DOWNLOAD, start, end, previousStart, previousEnd);

        AnalyticsOverviewCards cards = new AnalyticsOverviewCards(profileViews, projectViews, contactRequests, cvDownloads);
        return new AnalyticsOverviewResponse(from, to, cards);
    }

    public List<AnalyticsTrendPoint> getProfileViewsTrend(LocalDate from, LocalDate to) {
        LocalDateTime start = startOfDay(from);
        LocalDateTime end = endOfDay(to);

        Aggregation aggregation = Aggregation.newAggregation(
                Aggregation.match(Criteria.where("type").is(AnalyticsEventType.PROFILE_VIEW)
                        .and("createdAt").gte(start).lte(end)),
                Aggregation.project()
                        .and(DateOperators.DateToString.dateOf("createdAt").toString("%Y-%m-%d")).as("date"),
                Aggregation.group("date").count().as("count"),
                Aggregation.sort(org.springframework.data.domain.Sort.by("_id").ascending())
        );

        AggregationResults<Document> results = mongoTemplate.aggregate(aggregation, AnalyticsEvent.class, Document.class);
        Map<LocalDate, Long> counts = new HashMap<>();
        for (Document doc : results.getMappedResults()) {
            String dateValue = doc.getString("_id");
            if (dateValue != null) {
                counts.put(LocalDate.parse(dateValue), toLong(doc.get("count")));
            }
        }

        List<AnalyticsTrendPoint> points = new ArrayList<>();
        for (LocalDate date = from; !date.isAfter(to); date = date.plusDays(1)) {
            points.add(new AnalyticsTrendPoint(date, counts.getOrDefault(date, 0L)));
        }
        return points;
    }

    public List<AnalyticsSourceBreakdown> getTopSources(LocalDate from, LocalDate to) {
        LocalDateTime start = startOfDay(from);
        LocalDateTime end = endOfDay(to);

        Aggregation aggregation = Aggregation.newAggregation(
                Aggregation.match(Criteria.where("type").is(AnalyticsEventType.PROFILE_VIEW)
                        .and("createdAt").gte(start).lte(end)),
                Aggregation.project()
                        .and(ConditionalOperators.ifNull("source").then(DEFAULT_SOURCE)).as("source"),
                Aggregation.group("source").count().as("count"),
                Aggregation.sort(org.springframework.data.domain.Sort.by("count").descending())
        );

        AggregationResults<Document> results = mongoTemplate.aggregate(aggregation, AnalyticsEvent.class, Document.class);
        Map<String, Long> normalizedCounts = new HashMap<>();
        for (Document doc : results.getMappedResults()) {
            String sourceValue = doc.getString("_id");
            String normalized = normalizeSource(sourceValue);
            normalizedCounts.merge(normalized, toLong(doc.get("count")), Long::sum);
        }

        long total = normalizedCounts.values().stream().mapToLong(Long::longValue).sum();
        return normalizedCounts.entrySet().stream()
                .map(entry -> new AnalyticsSourceBreakdown(
                        entry.getKey(),
                        entry.getValue(),
                        total == 0 ? 0.0 : roundPercent(((double) entry.getValue() / (double) total) * 100.0)
                ))
                .sorted((left, right) -> Long.compare(right.count(), left.count()))
                .collect(Collectors.toList());
    }

    public static double calculatePercentChange(long current, long previous) {
        if (previous == 0) {
            return current == 0 ? 0.0 : 100.0;
        }
        double change = ((double) (current - previous) / (double) previous) * 100.0;
        return roundPercent(change);
    }

    private AnalyticsMetric buildMetric(AnalyticsEventType type,
                                        LocalDateTime start,
                                        LocalDateTime end,
                                        LocalDateTime previousStart,
                                        LocalDateTime previousEnd) {
        long total = countByTypeAndRange(type, start, end);
        long previousTotal = countByTypeAndRange(type, previousStart, previousEnd);
        return new AnalyticsMetric(total, calculatePercentChange(total, previousTotal));
    }

    private long countByTypeAndRange(AnalyticsEventType type, LocalDateTime start, LocalDateTime end) {
        Query query = new Query(Criteria.where("type").is(type).and("createdAt").gte(start).lte(end));
        return mongoTemplate.count(query, AnalyticsEvent.class);
    }

    private static LocalDateTime startOfDay(LocalDate date) {
        return date.atStartOfDay();
    }

    private static LocalDateTime endOfDay(LocalDate date) {
        return date.atTime(LocalTime.MAX);
    }

    private static String normalizeSource(String source) {
        if (source == null || source.trim().isEmpty()) {
            return DEFAULT_SOURCE;
        }
        String trimmed = source.trim();
        for (String known : KNOWN_SOURCES) {
            if (known.equalsIgnoreCase(trimmed)) {
                return known;
            }
        }
        return "Other";
    }

    private static long toLong(Object value) {
        if (value instanceof Number number) {
            return number.longValue();
        }
        if (value == null) {
            return 0L;
        }
        return Long.parseLong(value.toString());
    }

    private static double roundPercent(double value) {
        return Math.round(value * 10.0) / 10.0;
    }
}
