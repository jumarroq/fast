import { ExecutionContext, html, repeat } from "@microsoft/fast-element";
import type { ViewTemplate } from "@microsoft/fast-element";
import { endTemplate, startTemplate } from "../patterns/start-end";
import { DataGrid, DataGridCell, DataGridRow } from "../data-grid";
import type { FoundationElementDefinition } from "../foundation-element";
import type { ElementDefinitionContext } from "../design-system";
import type { Calendar, CalendarDateInfo } from "./calendar";

/**
 * A basic Calendar title template that includes the month and year
 * @returns - A calendar title template
 * @public
 */
export const calendarTitleTemplate: ViewTemplate<Calendar> = html`
    <slot name="title">
        <div
            class="title"
            part="title"
            aria-label="${(x: Calendar) =>
                x.dateFormatter.getDate(`${x.month}-2-${x.year}`, {
                    month: "long",
                    year: "numeric",
                })}"
        >
            <span part="month">
                ${(x: Calendar) => x.dateFormatter.getMonth(x.month)}
            </span>
            <span part="year">${(x: Calendar) => x.dateFormatter.getYear(x.year)}</span>
        </div>
    </slot>
`;

/**
 * Calendar weekday label template
 * @returns - The weekday labels template
 * @public
 */
export const calendarWeekdayTemplate: (context) => ViewTemplate = context => {
    const cellTag = context.tagFor(DataGridCell);
    return html`
        <${cellTag}
            class="week-day"
            part="week-day"
            tabindex="-1"
            grid-column="${(x, c) => c.index + 1}"
            abbr="${x => x.abbr}"
        >
            ${x => x.text}
        </${cellTag}>
    `;
};

/**
 * A calendar day template
 * @param context - Element definition context for getting the cell tag for calendar-cell
 * @param todayString - A string representation for todays date
 * @returns - A calendar cell template for a given date
 * @public
 */
export const calendarCellTemplate: (
    context: ElementDefinitionContext,
    todayString: string
) => ViewTemplate<CalendarDateInfo> = (
    context: ElementDefinitionContext,
    todayString: string
) => {
    const cellTag: string = context.tagFor(DataGridCell);
    return html`
        <${cellTag}
            class="${(x, c) => c.parentContext.parent.getDayClassNames(x, todayString)}"
            part="day"
            tabindex="-1"
            role="gridcell"
            day="${x => x.day}"
            month="${x => x.month}"
            year="${x => x.year}"
            grid-column="${(x, c) => c.index + 1}"
            @click="${(x, c) => c.parentContext.parent.handleDateSelect(c.event, x)}"
            @keydown="${(x, c) => c.parentContext.parent.handleKeydown(c.event, x)}"
            aria-label="${(x, c) =>
                c.parentContext.parent.dateFormatter.getDate(
                    `${x.month}-${x.day}-${x.year}`,
                    { month: "long", day: "numeric" }
                )}"
        >
            <div
                class="date"
                part="${x =>
                    todayString === `${x.month}-${x.day}-${x.year}` ? "today" : "date"}"
            >
                ${(x, c) => c.parentContext.parent.dateFormatter.getDay(x.day)}
            </div>
            <slot name="${x => x.month}-${x => x.day}-${x => x.year}"></slot>
        </${cellTag}>
    `;
};

/**
 *
 * @param context - Element definition context for getting the cell tag for calendar-cell
 * @param todayString - A string representation for todays date
 * @returns - A template for a week of days
 * @public
 */
export const calendarRowTemplate: (
    context: ElementDefinitionContext,
    todayString: string
) => ViewTemplate = (context: ElementDefinitionContext, todayString: string) => {
    const rowTag = context.tagFor(DataGridRow);
    return html`
        <${rowTag}
            class="week"
            part="week"
            role="row"
            role-type="default"
            grid-template-columns="1fr 1fr 1fr 1fr 1fr 1fr 1fr"
        >
        ${repeat(x => x, calendarCellTemplate(context, todayString), {
            positioning: true,
        })}
        </${rowTag}>
    `;
};

/**
 * The template for the {@link @microsoft/fast-foundation#(Calendar:class)} component.
 *
 * @param context - Element definition context for getting the cell tag for calendar-cell
 * @param definition - Foundation element definition
 * @returns - a template for a calendar month
 * @public
 */
export const calendarTemplate: (
    context: ElementDefinitionContext,
    definition: FoundationElementDefinition
) => ViewTemplate<Calendar> = (
    context: ElementDefinitionContext,
    definition: FoundationElementDefinition
) => {
    const gridTag: string = context.tagFor(DataGrid);
    const rowTag: string = context.tagFor(DataGridRow);
    const today: Date = new Date();
    const todayString: string = `${
        today.getMonth() + 1
    }-${today.getDate()}-${today.getFullYear()}`;
    return html`
        <template>
            ${startTemplate} ${calendarTitleTemplate}
            <slot></slot>
            <${gridTag} class="days" part="days" generate-header="none">
                <${rowTag}
                    class="week-days"
                    part="week-days"
                    role="row"
                    row-type="header"
                    grid-template-columns="1fr 1fr 1fr 1fr 1fr 1fr 1fr"
                >
                    ${repeat(x => x.getWeekdayText(), calendarWeekdayTemplate(context), {
                        positioning: true,
                    })}
                </${rowTag}>
                ${repeat(x => x.getDays(), calendarRowTemplate(context, todayString))}
            </${gridTag}>
            ${endTemplate}
        </template>
    `;
};