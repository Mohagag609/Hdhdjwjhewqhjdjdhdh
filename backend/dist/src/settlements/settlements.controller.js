"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettlementsController = void 0;
const common_1 = require("@nestjs/common");
const settlements_service_1 = require("./settlements.service");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class RunSettlementDto {
    phaseId;
}
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], RunSettlementDto.prototype, "phaseId", void 0);
let SettlementsController = class SettlementsController {
    settlements;
    constructor(settlements) {
        this.settlements = settlements;
    }
    async run(projectId, dto) {
        return this.settlements.run(projectId, dto.phaseId);
    }
    async list(projectId, phaseId) {
        return this.settlements.list(projectId, phaseId);
    }
};
exports.SettlementsController = SettlementsController;
__decorate([
    (0, common_1.Post)('run'),
    __param(0, (0, common_1.Param)('projectId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, RunSettlementDto]),
    __metadata("design:returntype", Promise)
], SettlementsController.prototype, "run", null);
__decorate([
    (0, common_1.Get)(':phaseId'),
    __param(0, (0, common_1.Param)('projectId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('phaseId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], SettlementsController.prototype, "list", null);
exports.SettlementsController = SettlementsController = __decorate([
    (0, swagger_1.ApiTags)('settlements'),
    (0, common_1.Controller)('projects/:projectId/settlements'),
    __metadata("design:paramtypes", [settlements_service_1.SettlementsService])
], SettlementsController);
//# sourceMappingURL=settlements.controller.js.map